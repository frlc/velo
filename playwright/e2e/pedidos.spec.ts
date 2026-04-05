import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'
import { OrderLookupPage } from '../support/pages/OrderLookupPage'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de pedidos', () => {

 
  test.beforeEach(async ({page}) => {

    // Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido') 

  })  

  test('deve consultar um pedido aprovado',{ tag: '@TC-002' }, async ({ page }) => {

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
  
    //Act
    const orderLookupPage = new OrderLookupPage(page)
    await orderLookupPage.searchOrder(order.number)
  
    //Assert    
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
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

      const statusBadge = page.getByRole('status').filter({ hasText: order.status })
      await expect(statusBadge).toContainClass('bg-green-100')
      await expect(statusBadge).toContainClass('text-green-700')

      const statusIcon = statusBadge.locator('svg')
      await expect(statusIcon).toContainClass('lucide-circle-check-big')
  
  })

  test('deve consultar um pedido reprovado',{ tag: '@TC-003' }, async ({ page }) => {

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

    //Act
    const orderLookupPage = new OrderLookupPage(page)
    await orderLookupPage.searchOrder(order.number)
  
    //Assert    
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
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
      
      const statusBadge = page.getByRole('status').filter({ hasText: order.status })
      await expect(statusBadge).toContainClass('bg-red-100')
      await expect(statusBadge).toContainClass('text-red-700')

      const statusIcon = statusBadge.locator('svg')
      await expect(statusIcon).toContainClass('lucide-circle-x')
  
  })

  test('deve consultar um pedido em analise',{ tag: '@TC-004' }, async ({ page }) => {

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
  
    //Act
    const orderLookupPage = new OrderLookupPage(page)
    await orderLookupPage.searchOrder(order.number)
  
    //Assert    
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
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
      
      const statusBadge = page.getByRole('status').filter({ hasText: order.status })
      await expect(statusBadge).toContainClass('bg-amber-100')
      await expect(statusBadge).toContainClass('text-amber-700')

      const statusIcon = statusBadge.locator('svg')
      await expect(statusIcon).toContainClass('lucide-clock')
  
  })

  test('deve exibir mensagem quando o pedido não é encontrado',{ tag: '@TC-005' }, async ({ page }) => {

    //Test data:
    const orderId = generateOrderCode()

    //Act
    const orderLookupPage = new OrderLookupPage(page)
    await orderLookupPage.searchOrder(orderId)
  
    //Assert   
   const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
   await expect(title).toBeVisible()

   await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - img
    - heading "Pedido não encontrado" [level=3]
    - paragraph: Verifique o número do pedido e tente novamente
    `)
      
  })
  
})




