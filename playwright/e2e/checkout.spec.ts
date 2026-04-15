import type { Locator } from '@playwright/test'
import { test, expect } from '../support/fixtures'
import type { OrderDetails } from '../support/actions/orderLookupActions'
import { deleteOrdersByCustomerEmail, upsertOrder } from '../support/database/orderRepository'

import testData from '../support/fixtures/orders.json' with { type: 'json' }

const STORE_PAULISTA = 'Velô Paulista - Av. Paulista, 1000'

function splitCustomerName(fullName: string): { name: string; lastname: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { name: '', lastname: '' }
  if (parts.length === 1) return { name: parts[0]!, lastname: parts[0]! }
  return { name: parts[0]!, lastname: parts.slice(1).join(' ') }
}

function formatPriceBrl(totalPrice: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(totalPrice))
}

type CheckoutAlerts = {
  name: Locator
  lastname: Locator
  email: Locator
  phone: Locator
  document: Locator
  store: Locator
  terms: Locator
}

test.describe('Checkout', () => {
  test.describe('Validações de campos obrigatórios', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    })

    let alerts: CheckoutAlerts

    test.beforeEach(async ({ app }) => {
      alerts = app.checkout.elements.alerts
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {
      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'papito@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999',
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(STORE_PAULISTA)
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@.com',
        document: '00000014141',
        phone: '(11) 99999-9999',
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(STORE_PAULISTA)
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999',
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(STORE_PAULISTA)
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999',
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(STORE_PAULISTA)

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('e2e - Pagamento à vista', () => {
    test('deve concluir pedido com pagamento à vista sem análise de crédito', async ({ page, app }) => {
      const order: OrderDetails = testData.aprovado as OrderDetails
      const expectedTotal = formatPriceBrl(order.total_price)
      const { name, lastname } = splitCustomerName(order.customer.name)

      const checkoutCustomer = {
        name,
        lastname,
        email: order.customer.email,
        phone: order.customer.phone,
        document: order.customer.document.replace(/\D/g, ''),
      }

      // Evita acumular um `VLO-*` novo a cada execução: zera pedidos desse e-mail e recria só a massa do JSON.
      await deleteOrdersByCustomerEmail(order.customer.email)
      await upsertOrder(order)

      // Arrange — página principal
      await page.goto('/')
      await expect(page.getByTestId('landing-page')).toBeVisible()

      // Arrange — configurador (opções padrão)
      await page.getByTestId('cta-button').click()
      await expect(page).toHaveURL(/\/configure/)
      await app.configurator.expectPrice(expectedTotal)
      await app.configurator.finishConfigurator()

      // Arrange — checkout (à vista: total do veículo, sem juros)
      await app.checkout.expectLoaded()
      await app.checkout.selectPaymentAvista()
      await app.checkout.expectSummaryTotal(expectedTotal)

      await app.checkout.fillCustomerlData(checkoutCustomer)
      await app.checkout.selectStore(STORE_PAULISTA)
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText('Pedido Aprovado!')
      await expect(page.getByTestId('order-id')).toBeVisible()
      await expect(page.getByText(expectedTotal).first()).toBeVisible()
    })
  })
})
