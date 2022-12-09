import { create } from 'venom-bot'
import cpf from 'cpf-valid'

let supportStage = {}
let customerBase = [{
	"number": "0000000000000@c.us",
	"name": "Teste Teste",
	"cpf": "00000000000",
	"id": "0",
	"issue": "0",
	"order": "00000",
	"exists": false,
	"reseted": false,
	"chatting": false
}]
let chatingCustomer
const issueTranslator = {
	"1": "rastreamento",
	"2": "cancelamento",
	"3": "devolução",
	"4": "atendimento humano"
}

function lookingCustomer(mf) {
	for (let i = 0; i < customerBase.length; i++) {
		if(customerBase[i].number == mf) return chatingCustomer = i
	}
	return customerBase[chatingCustomer].id
}

function onlyNumber(input) {
	return input.match(/[0-9]+/g);
}

function sendSupportRequest(client, customer) {
	sendMessage(client, '5511980299609@c.us',
	`Requisito suporte de atendente
	${customerBase[customer].name} está pedindo suporte com ${issueTranslator[customerBase[customer].issue]}
	número do cliente: ${customerBase[customer].number}
	cpf do cliente: ${customerBase[customer].cpf}
	id do cliente: ${customerBase[customer].id}
	antes de iniciar o atendimento, coloque 'start id: ${customerBase[customer].id}'
	assim que finalizar o atendimento, coloque 'end id: ${customerBase[customer].id}'
	caso de algum erro com o cadastro do cliente dentro do bot, coloque 'reset id: ${customerBase[customer].id}'`)
}

async function sendMessage(client, number, text){
	await client.sendText(number, text)
		.then(res => {
			console.log(`Envio de mensagem para ${number}, reultado: ${res.status}`);
		})
		.catch(e => console.log(e))
}

create(
	{ session: 'Pompom', useChrome: false }
)
	.then(async client => {
		start(client)
	})
	.catch(e => {console.log(e);})

function start(client) {

	client.onMessage(async (message) => {

		if((message.from == '5511980299609@c.us' || message.from == '5511958576907@c.us')){
			if(message.body.toLowerCase().includes("reset")){
				const customerID = onlyNumber(message.body)
				if(customerBase[customerID].reseted) {
					await sendMessage(client, message.from, 'Cliente já resetado')
				} else {
					await sendMessage(client, message.from, 'Cliente resetado com sucesso')
					supportStage[customerBase[customerID].number] = 4
					customerBase[customerID].chatting = false
					customerBase[customerID].reseted = true
					customerBase[customerID].issue = ''
					customerBase[customerID].order = ''
					
				return
				}
			}

			if(message.body.toLowerCase().includes("start")){
				const customerID = onlyNumber(message.body)
				if(customerBase[customerID].chatting) {
					await sendMessage(client, message.from, 'Conversa com o cliente já foi iniciada')
				} else {
					await sendMessage(client, message.from, 'Conversa com cliente iniciada com sucesso')
					supportStage[customerBase[customerID].number] = 4
					customerBase[customerID].chatting = true
				return
				}
			}

			if(message.body.toLowerCase().includes("end")){
				const customerID = onlyNumber(message.body)
				if(!customerBase[customerID].chatting) {
					await sendMessage(client, message.from, 'Conversa com o cliente já foi encerrada')
				} else {
					await sendMessage(client, message.from, 'Conversa com cliente encerrada com sucesso')
					supportStage[customerBase[customerID].number] = 4
					customerBase[customerID].chatting = false
				return
				}
			}

		}

		//!message.isGroupMsg && !message.sender.isMyContact && !message.fromMe || 
		// 5511958576907@c.us 5511980299609@c.us
		if(!message.isGroupMsg && !message.sender.isMyContact && !message.fromMe || 
			(message.from == '5511980299609@c.us' || message.from == '5511979808892@c.us' || message.from == '5511943185301@c.us')) {

			if(supportStage[message.from] == undefined){
				supportStage[message.from] = 1
				let customer = {
					"number": "",
					"name": "",
					"cpf": "",
					"id": "",
					"issue": "",
					"order": "",
					"exists": false,
					"reseted": false,
					"chatting": false
				}
				customer.id = customerBase.length
				customer.number = message.from
				customerBase.push(customer)
				await sendMessage(client, message.from, 'Bem vindo a central de suporte Pompom, eu sou um bot, e vou pedir algumas informações para que possamos agilizar o processo do atendimento, ok?')
					.then(result => {console.log(result.status);})
					.catch(e => console.log(e))
				await sendMessage(client, message.from, 'Primeiramente, peço que confirme seu nome, por gentileza')
					.then(result => {console.log(result.status);})
					.catch(e => console.log(e))
			} else {
				switch (supportStage[message.from]) {
					case 0:
						break
					
					case 1:
						chatingCustomer = lookingCustomer(message.from)
						customerBase[chatingCustomer].name = message.body
						await sendMessage(client, message.from, `Perfeito! Agora ${customerBase[chatingCustomer].name}, me informe seu CPF, por gentileza?`)
						supportStage[message.from] = 2
						break;

					case 2:
						chatingCustomer = lookingCustomer(message.from)
						if(customerBase[chatingCustomer].exists) {
							await sendMessage(client, message.from, `Bem vindo novamente ${customerBase[chatingCustomer].name}, poderia me informar sobre o que se trata essa consulta, por favor?`)
							await sendMessage(client, message.from, `Digite 1 para Rastreamento de pedidos, 2 para cancelamentos, 3 para devoluções, 4 para conversar com um atendente`)
							supportStage[message.from] = 3
							customerBase[chatingCustomer].reseted = false
						} else {
							customerBase[chatingCustomer].cpf = message.body
							if(cpf(customerBase[chatingCustomer].cpf)){
								await sendMessage(client, message.from, `Perfeito! Agora ${customerBase[chatingCustomer].name}, poderia me informar sobre o que se trata essa consulta, por favor?`)
								await sendMessage(client, message.from, `Digite 1 para Rastreamento de pedidos, 2 para cancelamentos, 3 para devoluções, 4 para conversar com um atendente`)
								supportStage[message.from] = 3
								customerBase[chatingCustomer].exists = true

							} else {
								await sendMessage(client, message.from, `${customerBase[chatingCustomer].name}, CPF não válido, tente novamente, por favor`)
							}
						}
						break

					case 3:
						chatingCustomer = lookingCustomer(message.from)
						if(message.body.toLowerCase() == 1
							|| message.body.toLowerCase() == 2
							|| message.body.toLowerCase() == 3
							|| message.body.toLowerCase() == 4
							|| customerBase[chatingCustomer].order){
								customerBase[chatingCustomer].issue = message.body
								if(message.body.toLowerCase() != 4){
									await sendMessage(client, message.from, `${customerBase[chatingCustomer].name}, poderia me informar o número do pedido, por gentileza?`)
									supportStage[message.from] = 4
								} else {
									await sendMessage(client, message.from, `${customerBase[chatingCustomer].name}, iremos te enviar para um atendente, peço que aguarde um momento!`)
									sendSupportRequest(client, chatingCustomer)
									supportStage[message.from] = 5

								}
							} else {
								await sendMessage(client, message.from, `Não entendi ${customerBase[chatingCustomer].name}, poderia digitar 1 para Rastreamento de pedidos, 2 para cancelamentos, 3 para devoluções, 4 para conversar com um atendente`)
							}
						break
						
						case 4:
							chatingCustomer = lookingCustomer(message.from)
							customerBase[chatingCustomer].order = message.body
							await sendMessage(client, message.from, `Perfeito! Agora ${customerBase[chatingCustomer].name}, iremos te enviar para um atendente, peço que aguarde um momento`)
							sendSupportRequest(client, chatingCustomer)
							supportStage[message.from] = 5
						break;

					case 5:
						chatingCustomer = lookingCustomer(message.from)
						await sendMessage(client, message.from, `${customerBase[chatingCustomer].name}, já te enviamos a um atendente, poderia, por gentileza, esperar mais um pouco, nossa fila de atendimento está congestionada no momento`)
						break
					
					default:
						break;
				}
			}
		}
	})
}