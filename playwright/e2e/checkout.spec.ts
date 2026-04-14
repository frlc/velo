import type { Locator } from '@playwright/test'
import { test, expect } from '../support/fixtures'

const STORE_PAULISTA = 'Velô Paulista - Av. Paulista, 1000'

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

  test.describe('CT05 - Financiamento com score aprovado', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ score: 750, status: 'Done' }),
        })
      })
    })

    test.afterEach(async ({ page }) => {
      await page.unroute('**/functions/v1/credit-analysis')
    })

    test('deve aprovar pedido com financiamento e score acima de 700', async ({ page, app }) => {
      const testData = {
        customer: {
          name: 'Maria',
          lastname: 'Santos',
          email: 'maria.santos.financiamento@example.com',
          phone: '(11) 98888-7777',
          document: '52998224725',
        },
        store: STORE_PAULISTA,
        entryValue: 0,
        expectedInstallment: 'R$ 3.400,00',
        expectedTotalFinanced: 'R$ 40.800,00',
        baseVehicleTotal: 'R$ 40.000,00',
      } as const

      // Arrange
      await page.goto('/')
      await expect(page.getByTestId('landing-page')).toBeVisible()

      await page.getByTestId('cta-button').click()
      await expect(page).toHaveURL(/\/configure/)

      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()
      await app.checkout.expectSummaryTotal(testData.baseVehicleTotal)

      await app.checkout.fillCustomerlData(testData.customer)
      await app.checkout.selectStore(testData.store)
      await app.checkout.acceptTerms()

      await app.checkout.selectFinancing()
      await app.checkout.setEntryValue(testData.entryValue)
      await app.checkout.expectFinancingInstallmentInPaymentCard(testData.expectedInstallment)
      await app.checkout.expectSummaryTotal(testData.expectedTotalFinanced)

      // Act
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText('Pedido Aprovado!')
      await expect(page.getByText(`(12x de ${testData.expectedInstallment})`)).toBeVisible()
    })
  })
})
