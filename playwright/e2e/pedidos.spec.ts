import { test, expect } from '@playwright/test'

test('deve consulta um pedido aprovado',{ tag: '@TC-002' }, async ({ page }) => {

//Test data:
const orderId = 'VLO-4V79FY'
const orderStatus = 'APROVADO'

  //Arrange
  await page.goto('http://localhost:5173/')
  // Checkpoint 1: Verificar se a página está online
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  // Checkpoint 2: Verificar se a página de consulta de pedido está carregada
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido') 

//Act
  await page.getByTestId('search-order-id').fill(orderId)
  await page.getByTestId('search-order-button').click()

//Assert
  // Checkpoint 3: Verificar se o pedido foi encontrado
  await expect(page.getByTestId('order-result-VLO-4V79FY')).toBeVisible({timeout: 15_000})  

  //code normal
  await expect(page.getByTestId('order-result-id')).toContainText(orderId)
  await expect(page.getByTestId('order-result-status')).toContainText(orderStatus)

  //Challenge solution 1:
  // await expect(page.locator('p.font-mono.font-medium')).toContainText('VLO-4V79FY')
  // await expect(page.locator('div.bg-green-100.text-green-700')).toContainText('APROVADO')
  
  //Challenge solution 2:
  // await expect(page.getByTestId('order-result-VLO-4V79FY')).toContainText('VLO-4V79FY')
  // await expect(page.getByTestId('order-result-VLO-4V79FY')).toContainText('APROVADO')

  //Challenge class:
  // const containerPedido = page.getByRole('paragraph')
  //.filter({ hasText: '/^Pedido$/' })//Expressão regular para pegar o texto 'Pedido'
  // .locator('..') //Sobe um nivel e pega o parent do p que tem o texto 'Pedido'
  //await expect(containerPedido).toContainText('VLO-4V79FY')

})
