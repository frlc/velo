import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/orderRepository'
import { createCheckoutActions } from '../support/actions/checkoutActions'
import { createConfiguratorActions } from '../support/actions/configuratorActions'

const DEFAULT_STORE = 'Velô Paulista'
const DEFAULT_TOTAL_PRICE = 'R$ 40.000,00'

type AppActions = {
  checkout: ReturnType<typeof createCheckoutActions>
  configurator: ReturnType<typeof createConfiguratorActions>
}

type CustomerData = {
  name: string
  lastname: string
  email: string
  document: string
  phone: string
}

type OrderData = CustomerData & {
  store: string
  paymentMethod: 'À Vista' | 'Financiamento'
  totalPrice: string
  downPayment?: string
}

function makeCustomer(overrides: Partial<CustomerData> = {}): CustomerData {
  return {
    name: 'Fernando',
    lastname: 'Papito',
    email: 'papito@teste.com',
    document: '05366127068',
    phone: '(11) 99999-9999',
    ...overrides,
  }
}

function makeOrder(overrides: Partial<OrderData> = {}): OrderData {
  return {
    ...makeCustomer(),
    store: DEFAULT_STORE,
    paymentMethod: 'À Vista',
    totalPrice: DEFAULT_TOTAL_PRICE,
    ...overrides,
  }
}

async function prepareOrderCheckout(app: AppActions, order: OrderData) {
  await deleteOrderByEmail(order.email)
  await app.configurator.startFromHomeAndGoToCheckout(order.totalPrice)
  await app.checkout.expectLoaded()
  await app.checkout.fillCheckoutForm(order)
}

test.describe('Checkout', () => {
  test.describe('Validações de campos obrigatórios', () => {
    test.beforeEach(async ({ app }) => {
      await app.checkout.openOrderForm()
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      const { alerts } = app.checkout.elements

      await app.checkout.submit()

      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {
      const { alerts } = app.checkout.elements
      const customer = makeCustomer({ name: 'A', lastname: 'B', document: '00000014141' })

      await app.checkout.fillCheckoutForm({ ...customer, store: DEFAULT_STORE }, { acceptTerms: true })
      await app.checkout.submit()

      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const { alerts } = app.checkout.elements
      const customer = makeCustomer({ email: 'papito@.com', document: '00000014141' })

      await app.checkout.fillCheckoutForm({ ...customer, store: DEFAULT_STORE }, { acceptTerms: true })
      await app.checkout.submit()

      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {
      const { alerts } = app.checkout.elements
      const customer = makeCustomer({ email: 'papito@test.com', document: '00000014199' })

      await app.checkout.fillCheckoutForm({ ...customer, store: DEFAULT_STORE }, { acceptTerms: true })
      await app.checkout.submit()

      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
      const { alerts, terms } = app.checkout.elements
      const customer = makeCustomer({ email: 'papito@test.com', document: '00000014199' })

      await app.checkout.fillCheckoutForm({ ...customer, store: DEFAULT_STORE })
      await expect(terms).not.toBeChecked()

      await app.checkout.submit()

      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {
    test('deve criar um pedido com sucesso para pagamento à vista', async ({ app }) => {
      const order = makeOrder()

      await prepareOrderCheckout(app, order)
      await app.checkout.selectPaymentMethod(order.paymentMethod)
      await app.checkout.expectSummaryTotal(order.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await app.checkout.expectOrderResult('Pedido Aprovado!')
    })

    const financingScenarios = [
      {
        title: 'deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento',
        score: 710,
        expectedHeading: /Pedido Aprovado!/i,
        order: makeOrder({
          name: 'Steve',
          lastname: 'Woz',
          email: 'woz@velo.dev',
          document: '65493881047',
          paymentMethod: 'Financiamento',
        }),
      },
      {
        title: 'deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento',
        score: 600,
        expectedHeading: /Pedido em Análise!/i,
        order: makeOrder({
          name: 'Tony',
          lastname: 'Stark',
          email: 'tony@stark.com',
          document: '74690251037',
          paymentMethod: 'Financiamento',
        }),
      },
      {
        title: 'deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada',
        score: 500,
        expectedHeading: /Crédito Reprovado/i,
        order: makeOrder({
          name: 'Clark',
          lastname: 'Kent',
          email: 'clark@dailyplanet.com',
          document: '52998224725',
          paymentMethod: 'Financiamento',
        }),
      },
      {
        title: 'deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%',
        score: 500,
        expectedHeading: /Crédito Reprovado/i,
        order: makeOrder({
          name: 'Diana',
          lastname: 'Prince',
          email: 'diana@themiscira.com',
          document: '11144477735',
          paymentMethod: 'Financiamento',
          downPayment: '10000',
        }),
      },
      {
        title: 'deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%',
        score: 450,
        expectedHeading: /Pedido Aprovado/i,
        order: makeOrder({
          name: 'Richard',
          lastname: 'Fortus',
          email: 'richard@gmail.com',
          document: '39434745004',
          paymentMethod: 'Financiamento',
          downPayment: '20000',
        }),
      },
      {
        title: 'deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%',
        score: 300,
        expectedHeading: /Pedido Aprovado/i,
        order: makeOrder({
          name: 'Axl',
          lastname: 'Rose',
          email: 'alx@gnr.com',
          document: '79327557000',
          paymentMethod: 'Financiamento',
          downPayment: '30000',
        }),
      },
    ]

    for (const scenario of financingScenarios) {
      test(scenario.title, async ({ app }) => {
        await app.checkout.mockCreditAnalysis(scenario.score)
        await prepareOrderCheckout(app, scenario.order)
        await app.checkout.submitPayment({
          paymentMethod: scenario.order.paymentMethod,
          downPayment: scenario.order.downPayment,
        })

        await app.checkout.expectOrderResult(scenario.expectedHeading)
      })
    }
  })
})