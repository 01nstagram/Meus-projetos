require('dotenv').config(); // Carregar variáveis de ambiente do .env
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, EmbedBuilder, REST, Routes, SlashCommandBuilder, Collection } = require('discord.js');
const axios = require('axios');

const { token, clientId, authorizedId } = process.env; // Incluindo o ID autorizado para adicionar senha

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ],
});

client.commands = new Collection();

// 🔄 Definição dos comandos Slash
const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Iniciar spam')
        .addStringOption(option => option.setName('senha').setDescription('Digite a senha para usar a mensagem personalizada (opcional)')),
    new SlashCommandBuilder().setName('setspam').setDescription('Configurar a mensagem de spam')
        .addStringOption(option => option.setName('message').setDescription('Mensagem de spam personalizada').setRequired(true))
        .addStringOption(option => option.setName('senha').setDescription('Senha associada à mensagem de spam')),
    new SlashCommandBuilder().setName('waifu').setDescription('Obter 4 waifus')
].map(command => command.toJSON());

// 🔄 Atualizar comandos automaticamente ao iniciar
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        console.log('🔄 Atualizando comandos globais...');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Comandos atualizados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar comandos:', error);
    }
})();

// 🔄 Evento quando o bot ficar online
client.once('ready', () => {
    console.log('✅ Bot está online!');
});

// Variáveis para armazenar as senhas e as mensagens de spam
let spamMessages = {
    default: "ПАКИСТАН НА ВЕРХУ ||PAKISTAN NÃO TA PURO|| NOS NO TOPO O RESTO É RANDOM https://discord.gg/7CadnxeryD @here @everyone"
};

// Variável para armazenar senhas e suas mensagens associadas
let passwordMessages = {};

const sendMessage = async (interaction, msg, isEphemeral = false) => {
    try {
        await interaction.followUp({
            content: msg,
            flags: isEphemeral ? MessageFlags.Ephemeral : undefined
        });
    } catch (error) {
        console.error(`❌ Erro ao enviar mensagem: ${error.message}`);
    }
};

// 📜 Comando /spam
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'spam') {
        const senha = interaction.options.getString('senha'); // Obter a senha fornecida (se houver)

        // Verificar a senha
        const messageToSpam = senha && passwordMessages[senha] ? passwordMessages[senha] : spamMessages.default;

        await interaction.deferReply();

        await sendMessage(interaction, 'Iniciando spam...', true);

        // Realizar o spam (enviar múltiplas mensagens)
        for (let i = 0; i < 10; i++) {
            await sendMessage(interaction, messageToSpam);
        }

        await sendMessage(interaction, 'O spam foi finalizado!', true);
    }

    if (interaction.commandName === 'setspam') {
        if (interaction.user.id !== authorizedId) {
            return await sendMessage(interaction, 'Você não tem permissão para configurar a mensagem de spam!', true);
        }

        // Definir resposta imediata (deferir a interação)
        await interaction.deferReply();

        const newMessage = interaction.options.getString('message'); // A nova mensagem de spam a ser configurada
        const password = interaction.options.getString('senha'); // A senha opcional associada à mensagem

        if (!newMessage) {
            return await sendMessage(interaction, 'Você precisa fornecer uma mensagem para configurar o spam!', true);
        }

        if (password) {
            passwordMessages[password] = newMessage; // Armazenar a mensagem associada à senha
            await sendMessage(interaction, `Mensagem de spam configurada com a senha: **${password}**`, true);
        } else {
            spamMessages.default = newMessage; // Se não houver senha, configura a mensagem padrão
            await sendMessage(interaction, 'Mensagem de spam padrão configurada com sucesso!', true);
        }
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'spamButton') {
        await interaction.deferUpdate();

        // Obter a senha fornecida pelo usuário, se houver
        const senha = interaction.options.getString('senha');
        const messageToSpam = senha && passwordMessages[senha] ? passwordMessages[senha] : spamMessages.default;

        await sendMessage(interaction, 'Iniciando spam...', true);

        // Realizar o spam (enviar múltiplas mensagens)
        for (let i = 0; i < 10; i++) {
            await sendMessage(interaction, messageToSpam);
        }

        await sendMessage(interaction, 'O spam foi finalizado!', true);
    }
});

// 🔑 Logando o bot
client.login(token);
