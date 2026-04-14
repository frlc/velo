import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  return {
    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      const el = page.getByTestId('summary-total-price')
      await expect(el).toBeVisible()
      await expect(el).toHaveText(price)
    },

    async expectOptionalNotListed(name: string) {
      await expect(
        page.getByRole('listitem').filter({ hasText: name }),
      ).toHaveCount(0)
    },
  }
}
