import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'

test.describe('Consulta de pedidos', () => {

 
  test.beforeEach(async ({page}) => {

    await page.goto('http://localhost:5173/')
    // Checkpoint 1: Verificar se a página está online
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    // Checkpoint 2: Verificar se a página de consulta de pedido está carregada
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido') 
    
  })
 

  test('deve consulta um pedido aprovado',{ tag: '@TC-002' }, async ({ page }) => {

    //Test data:
    const orderId = 'VLO-4V79FY'
    const orderStatus = 'APROVADO'
  
    //Arrange
    
  
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

  test('deve exibir mensagem de pedido nao encontrado',{ tag: '@TC-003' }, async ({ page }) => {

    //Test data:
    const orderId = generateOrderCode()
  
    //Arrange
    
  
    //Act
    await page.getByTestId('search-order-id').fill(orderId)
    await page.getByTestId('search-order-button').click()
  
    //Assert
   // Checkpoint 3: Verificar se a mensagem de pedido não encontrado foi exibida
   const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
   await expect(title).toBeVisible()
   // const message = page.locator('//p[text()="Verifique o número do pedido e tente novamente"]') //OR
   // const message = page.locator('p', {hasText: 'Verifique o número do pedido e tente novamente'})
   //await expect(message).toBeVisible()  

   await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - img
    - heading "Pedido não encontrado" [level=3]
    - paragraph: Verifique o número do pedido e tente novamente
    `)
      
  })
  
})




