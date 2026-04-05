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

  test('deve consulta um pedido aprovado usando snapshot',{ tag: '@TC-004' }, async ({ page }) => {

    //Test data:
    const order = {
      number: 'VLO-4V79FY', 
      status: 'APROVADO',
      model: 'Velô Sprint',
      color: 'Glacier Blue',
      interior: 'cream',
      wheels: 'aero Wheels',
      customer: {
        name: 'fernando cruz',
        email: 'teste@teste.com',
      },
      payment: 'À Vista'
    }  
  
    //Arrange
    
  
    //Act
    await page.getByTestId('search-order-id').fill(order.number)
    await page.getByTestId('search-order-button').click()
  
    //Assert
    
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: ${order.model}
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: ${order.interior}
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

  
    
  
  })

  test('deve consulta um pedido Reprovado usando snapshot',{ tag: '@TC-005' }, async ({ page }) => {

    //Test data:
    const order = {
      number: 'VLO-5H0SCE', 
      status: 'REPROVADO',
      model: 'Velô Sprint',
      color: 'Midnight Black',
      interior: 'cream',
      wheels: 'sport Wheels',
      customer: {
        name: 'Gabriel Felipe',
        email: 'biel@lindo.com.br',
      },
      payment: 'À Vista'
    }  
  
    //Arrange
    
  
    //Act
    await page.getByTestId('search-order-id').fill(order.number)
    await page.getByTestId('search-order-button').click()
  
    //Assert
    
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: ${order.model}
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: ${order.interior}
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)   
  
  })

  test('deve consulta um pedido Em Analise usando snapshot',{ tag: '@TC-006' }, async ({ page }) => {

    //Test data:
    const order = {
      number: 'VLO-RPW1F5', 
      status: 'EM_ANALISE',
      model: 'Velô Sprint',
      color: 'Lunar White',
      interior: 'cream',
      wheels: 'aero Wheels',
      customer: {
        name: 'fernando financiado',
        email: 'teste@teste.com',
      },
      payment: 'Financiamento 12x'
    }  
  
    //Arrange
    
  
    //Act
    await page.getByTestId('search-order-id').fill(order.number)
    await page.getByTestId('search-order-button').click()
  
    //Assert
    
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: ${order.model}
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: ${order.interior}
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)   
  
  })
  
})




