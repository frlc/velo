# Documento de Casos de Teste - Velô Sprint

Este documento detalha os casos de teste funcionais para o sistema Velô Sprint - Configurador de Veículo Elétrico, cobrindo os módulos de Landing Page, Configurador, Checkout/Pedido, Análise de Crédito, Confirmação e Consulta de Pedidos.

---

### CT01 - Navegar para o Configurador da Landing Page

#### Objetivo
Validar se o usuário consegue acessar com sucesso o módulo Configurador de Veículo a partir da Landing Page inicial.

#### Pré-Condições
- O sistema deve estar rodando e acessível.
- A Landing Page ("/") deve ser a página atual.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a página inicial (Landing Page). | A página principal do Velô Sprint é carregada completamente. |
| 2  | Clicar no botão "Configurar" ou equivalente na Landing Page. | O sistema redireciona o usuário para a página do Configurador. |

#### Resultados Esperados
- O usuário é redirecionado com sucesso para a rota do Configurador.

#### Critérios de Aceitação
- A interface do configurador deve exibir a visualização do veículo.
- A URL deve ser atualizada para a rota correspondente ao configurador (ex: `/configure`).

---

### CT02 - Calculo Dinâmico do Preço Opcionais no Configurador

#### Objetivo
Validar as regras de precificação ao adicionar rodas e opcionais tecnológicos, verificando se o preço total é atualizado corretamente no resumo.

#### Pré-Condições
- O usuário deve estar na página do Configurador.
- Nenhuma opção extra deve estar selecionada (configuração padrão iniciada refletindo o veículo base de R$ 40.000).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Verificar o preço total inicial no rodapé/resumo. | O preço total exibe o valor base de R$ 40.000,00. |
| 2  | Selecionar a opção de Rodas "Sport". | O preço total é atualizado para R$ 42.000,00 (+ R$ 2.000). |
| 3  | Adicionar o opcional "Precision Park". | O preço total é atualizado para R$ 47.500,00 (+ R$ 5.500). |
| 4  | Adicionar o opcional "Flux Capacitor". | O preço total é atualizado para R$ 52.500,00 (+ R$ 5.000). |

#### Resultados Esperados
- O sistema calcula e atualiza dinamicamente o valor total final com exatidão conforme as seleções incrementadas (Total = R$ 52.500,00).

#### Critérios de Aceitação
- O valor base do veículo deve ser R$ 40.000.
- A adição das rodas "Sport" custa +R$ 2.000.
- A adição do "Precision Park" custa +R$ 5.500.
- A adição do "Flux Capacitor" custa +R$ 5.000.

---

### CT03 - Validação de Campos Obrigatórios e Formatação no Formulário de Pedido

#### Objetivo
Validar que o sistema impede prosseguir para a finalização caso campos obrigatórios do fomulário de checkout estejam ausentes ou mal formatados.

#### Pré-Condições
- O usuário completou uma configuração de veículo.
- O usuário clicou em avançar e está na página de Checkout/Pedido.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Deixar todos os campos do formulário em branco. | Nenhuma mudança ocorre. |
| 2  | Preencher os campos "Nome" e "Sobrenome" com apenas 1 caractere. | Nenhuma mensagem ainda, apenas entrada de texto. |
| 3  | Preencher o campo "Email" com valor inválido (ex: `teste.com`). | Entrada de texto permitida. |
| 4  | Clicar no botão "Confirmar Pedido". | O envio é impedido. O sistema exibe mensagens de erro indicando tamanho mínimo para Nome/Sobrenome, email inválido, além de CPF, Telefone e Termos obrigatórios não preenchidos. |

#### Resultados Esperados
- O sistema não permite a evolução do pedido e sinaliza de forma clara todos os campos inválidos ou não preenchidos na interface do usuário.

#### Critérios de Aceitação
- Nome e Sobrenome devem ter mensagens de erro caso possuam menos de 2 caracteres.
- Email deve ser validado adequadamente (deve conter o formato correto com "@").
- Telefone e CPF devem validar máscaras e quantidade de caracteres.
- "Loja para Retirada" e campo de aceite dos "Termos" são obrigatórios e devem apontar erro.

---

### CT04 - Submissão de Pedido de Compra à Vista (Fluxo Feliz)

#### Objetivo
Garantir que um usuário consegue efetivar com sucesso a compra de um veículo configurado optando pelo pagamento à vista.

#### Pré-Condições
- O usuário estar na página de Checkout/Pedido.
- O veículo base configurado possui valor total de R$ 40.000.
- Os dados do formulário do cliente estão preenchidos com valores válidos.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Na seção "Forma de Pagamento", clicar em "À Vista". | A opção "À Vista" fica destacada. |
| 2  | No painel de Resumo, verificar o valor total exibido. | Exibe R$ 40.000,00 sem adição de juros. |
| 3  | Clicar no botão "Confirmar Pedido". | O sistema registra o pedido, aprova imediatamente sem exigir análise de crédito e redireciona para a tela de Confirmação. |

#### Resultados Esperados
- O pedido é submetido com sucesso sem chamadas de API externas para análise de crédito de Score. 
- O formulário limpa os dados após o envio.

#### Critérios de Aceitação
- Pagamento à vista não deve acionar integração de Score.
- Redirecionamento automático para a tela de Confirmação, mostrando o resumo correto.

---

### CT05 - Submissão de Pedido com Financiamento e Score Aprovado (> 700)

#### Objetivo
Validar fluxo de integração com API de score e aprovação automática para cliente simulado com score de crédito superior a 700.

#### Pré-Condições
- Estar na tela de Checkout.
- Dados preenchidos com valores corretos.
- CPF utilizado está atrelado a um Score de Crédito > 700 (mock na API).
- Veículo de R$ 40.000 configurado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar a opção "Financiamento". | O formulário expande exibindo o campo para o valor da entrada, detalhes das parcelas e cálculo de juros. |
| 2  | Digitar `0` no valor de Entrada e confirmar se parcela reflete (40000 / 12 * 1.02) = R$ 3.400,00 mensais. | A interface exibe as 12 parcelas de R$ 3.400,00 e valor total financiado respectivo. |
| 3  | Clicar em "Confirmar Pedido". | Botão exibe sinal de carregamento ("Processando..."). |
| 4  | Aguardar integração. | O pedido é Aprovado, direcionando para a tela de Sucesso. |

#### Resultados Esperados
- Integração da Análise de Crédito é acionada e o status retornado para o pedido é logicamente classificado como "APROVADO".

#### Critérios de Aceitação
- CPF com Score > 700 deve classificar o order status para 'APROVADO'.
- O pedido final salva a escolha de financiamento juntamente aos cálculos de juros registrados na tela de sucesso.

---

### CT06 - Submissão com Financiamento e Score Em Análise (501 a 700)

#### Objetivo
Validar que scores medianos deixam o pedido em estado de análise.

#### Pré-Condições
- Estar na página de Checkout com formulário válidamente preenchido.
- Selecionado formato "Financiamento" com zero de entrada.
- CPF atrelado a Score entre 501 e 700 (ex: 600) na API simulada.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Clicar em "Confirmar Pedido". | Carregamento da análise de crédito é iniciado. |
| 2  | Aguardar resposta do sistema. | O sistema envia a ordem, mas ela é processada com sub-status/sinalização de 'EM_ANALISE'. Redireciona para sucesso informando que carece de avaliação manual. |

#### Resultados Esperados
- A compra entra no banco de dados com estado 'EM_ANALISE'.

#### Critérios de Aceitação
- CPF com score entre 501 a 700 define `orderStatus` como `EM_ANALISE`.
- O cliente visualiza a tela pós-checkout informando que o pedido está aguardando verificação por equipe humana.

---

### CT07 - Submissão com Financiamento e Score Reprovado (<= 500)

#### Objetivo
Validar que propostas de financiamento onde o crédito tem baixa avaliação do usuário são reprovadas pela API de análise de crédito.

#### Pré-Condições
- Estar na tela de Checkout, com todos os dados pessoais preenchidos.
- Selecionado "Financiamento" com valor de entrada 0.
- CPF atrelado a Score <= 500.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Clicar em "Confirmar Pedido". | Inicia-se consulta à provedora de Score. |
| 2  | Aguardar a validação. | O processamento não falha tecnicamente, porém o sistema sinaliza que o pedido em base será criado e finalizado com status 'REPROVADO'. |

#### Resultados Esperados
- Pedido submetido recebe obrigatoriamente a classificação de estado de reprovação.

#### Critérios de Aceitação
- Score <= 500 para entradas abaixo de 50% obriga que `orderStatus` seja `REPROVADO`.

---

### CT08 - Exceção de Crédito: Financiamento com Score Baixo e Entrada >= 50%

#### Objetivo
Validar controle de negócios de exceção onde uma entrada maior ou igual a 50% do valor total ignora pontuações de crédito arruinadas aprovando o pedido imediatamente.

#### Pré-Condições
- Estar na tela de Checkout. Variável veicular de Total = R$ 50.000 (qualquer veículo base configurado com alguns opcionais).
- CPF atrelado à API possui Score <= 500 (que normalmente leva à reprovação).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar "Financiamento". | Mostra os campos de valor de entrada e detalhes. |
| 2  | Inserir Valor da Entrada = R$ 25.000 ou superior. | O sistema recalcula os valores de tabela sobre os 25.000 residuais. |
| 3  | Clicar em "Confirmar Pedido". | Submete dados para serviço de score, avalia regra de bloqueio. |
| 4  | Observar resposta final. | Contrariando a restrição de "Score Baixo", sistema aceita a transação mudando flag para "APROVADO" e redireciona a Landing Confirmação. |

#### Resultados Esperados
- O pedido deve ser gravado e encaminhado à tela de sucesso em condição 'APROVADA'.

#### Critérios de Aceitação
- Regra de Negócio Crítica: Entrada >= 50% do valor total isenta e sobrepõe verificação de score ruim.
- O sistema considera (Valor da Entrada / Preço Total) >= 0.5.

---

### CT09 - Geração de Número do Pedido na Confirmação

#### Objetivo
Testar a visualização e formato do identificador único do pedido de modo que o usuário o guarde para consultas futuras no módulo de Consulta.

#### Pré-Condições
- Usuário acabou de submeter um pedido validado em Checkout (indiferente se à vista ou financiado).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Observar tela de Confirmação (Success.tsx). | Exibe mensagem de parabenização e dados do pedido. |
| 2  | Procurar campo com número do pedido "Order Number". | O código do pedido gerado (ex: VELO-3AD8) deve estar em destaque. |

#### Resultados Esperados
- Um identificador de pedido coeso é gerado e retornado.

#### Critérios de Aceitação
- A tela de Sucesso é acessível e não quebra durante renderização com dados vindo pelo state de redirecionamento.
- O número de rastreio/pedido (`order_number`) gerado deve aparecer com clareza.

---

### CT10 - Consulta de Pedido de Sucesso usando Número de Pedido Valido

#### Objetivo
Garantir o requerimento de segurança onde um cliente consegue visualizar seu pedido gerado usando apenas a credencial do Código/Número de Pedido criado.

#### Pré-Condições
- Usuário finalizou um pedido e resgatou um Número de Pedido (ex: `ORD-12345`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a página de "Consulta de Pedidos" (OrderLookup). | Formulário de consulta é exibido exigindo o número do pedido. |
| 2  | Preencher o input principal com a string: `ORD-12345`. | Máscara de texto e campo visual confirmam entrada. |
| 3  | Clicar no botão "Consultar". | O sistema busca na base de dados pelo match do número. |
| 4  | Validar informação renderizada na tela. | O sistema carrega e exibe sem erro ou falta de dados detalhes como status, informações configuradas do veículo e resumo de pagamento. |

#### Resultados Esperados
- Informação confidencial de pedido liberada apenas com a premissa de match absoluto do ID do pedido fornecido pelo usuário.

#### Critérios de Aceitação
- É impossível visualizar dados de um pedido sem fornecer o correspondente `order_number`.
- O layout carrega as propriedades de pedido para inspeção do usuário.

---

### CT11 - Consulta de Pedido Mal Sucedida com Número de Pedido Inválido

#### Objetivo
Verificar a segurança garantindo falha amigável quando o usuário passa um código incorreto na pesquisa de pedidos.

#### Pré-Condições
- Estar na página de "Consulta de Pedidos".

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Tentar consultar passando input totalmente em branco. | Validador de cliente intervine pedindo preenchimento, interface não permite chamada para a API. |
| 2  | Preencher de forma genérica um código aleatório (ex: `12312-AAAAS`). | Clicar em "Consultar" despacha para visualização. |
| 3  | Avaliar resposta. | O sistema retorna mensagem clara de que o pedido não pode ser encontrado ou não existe (Erro amigável para cliente, por exemplo, em Toast alert). |

#### Resultados Esperados
- A página bloqueia acesso e fornece instrução clara se errar o número de credencial de sua conta.

#### Critérios de Aceitação
- Inputs em branco não acionam loaders ou requests defeituosos ao backend (são bloqueados em tela).
- Apenas um erro na interface indicando "Pedido não Encontrado" (ou semelhante) deve ser visualizado, sem dar throw quebrando a UI da Single Page Application.
