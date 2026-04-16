import { Page, Route, expect } from '@playwright/test'

type CustomerData = {
  name: string
  lastname: string
  email: string
  phone: string
  document: string
}

type CheckoutFormData = CustomerData & {
  store: string
}

type PaymentData = {
  paymentMethod: string
  downPayment?: string
}

export function createCheckoutActions(page: Page) {

  const terms = page.getByTestId('checkout-terms')

  const alerts = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-lastname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-document'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms')
  }


  return {

    elements: {
      terms,
      alerts
    },

    async openOrderForm() {
      await page.goto('/order')
      await this.expectLoaded()
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillCustomerData(data: CustomerData) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-lastname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-document').fill(data.document)
    },

    // Keep compatibility while specs are migrated.
    async fillCustomerlData(data: CustomerData) {
      await this.fillCustomerData(data)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async fillCheckoutForm(data: CheckoutFormData, options?: { acceptTerms?: boolean }) {
      await this.fillCustomerData(data)
      await this.selectStore(data.store)

      if (options?.acceptTerms) {
        await this.acceptTerms()
      }
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async submitPayment(data: PaymentData) {
      await this.selectPaymentMethod(data.paymentMethod)

      if (data.downPayment) {
        await this.fillDownPayment(data.downPayment)
      }

      await this.acceptTerms()
      await this.submit()
    },

    async mockCreditAnalysis(score: number) {
      await page.route('**/functions/v1/credit-analysis', async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'Done',
            score,
          }),
        })
      })
    },

    async expectOrderResult(heading: string | RegExp) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    },
  }
}