const axios = require('axios'); // Para requisições HTTP
const readline = require('readline'); // Para capturar a entrada do usuário

// Cria a interface para ler a entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para enviar mensagem
async function enviarMensagem(token, quantidade, channelId) {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`; // Usando o ID do canal para enviar mensagens
  const headers = {
    'Authorization': `Bearer ${token}`, // Usa o token de usuário
    'Content-Type': 'application/json',
  };

  console.log('Iniciando o envio das mensagens...');

  for (let i = 0; i < quantidade; i++) {
    const data = {
      content: 'Mensagem enviada com sucesso!', // A mensagem que será enviada
    };

    try {
      await axios.post(url, data, { headers }); // Envia a mensagem
      console.log(`Mensagem ${i + 1} enviada com sucesso!`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.message);
    }
  }

  console.log('Envio de mensagens finalizado.');
}

// Função para capturar o token, quantidade de mensagens e ID do canal
function setup() {
  console.log('Bem-vindo ao Tools de Envio de Mensagens!\n');

  rl.question('Digite o Token do usuário: ', (token) => { // Solicita o token de usuário
    rl.question('Quantas mensagens deseja enviar? ', (quantidade) => { // Solicita a quantidade de mensagens
      quantidade = parseInt(quantidade);

      rl.question('Digite o ID do canal para spamar: ', (channelId) => { // Solicita o ID do canal
        if (token && quantidade && channelId) {
          console.log('Configurando o envio...\n');
          enviarMensagem(token, quantidade, channelId); // Inicia o envio das mensagens
        } else {
          console.log('Token, quantidade ou ID do canal não fornecidos. Por favor, tente novamente.');
        }

        rl.close(); // Fecha a interface de leitura
      });
    });
  });
}

setup();
