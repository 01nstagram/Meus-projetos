require('dotenv').config();
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, EmbedBuilder, REST, Routes, SlashCommandBuilder, Collection, WebhookClient } = require('discord.js');
const axios = require('axios');

const { token, clientId, webhookURL } = process.env;
const allowedUsers = ['1247674238102405262'];

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
const webhookClient = new WebhookClient({ url: webhookURL });
const spamMessages = {};

const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Iniciar spam'),
    new SlashCommandBuilder().setName('setspam').setDescription('Definir mensagem personalizada').addStringOption(option => 
        option.setName('senha').setDescription('Senha única').setRequired(true)).addStringOption(option => 
        option.setName('mensagem').setDescription('Mensagem de spam').setRequired(true)),
    new SlashCommandBuilder().setName('removespam').setDescription('Remover mensagem de spam').addStringOption(option => 
        option.setName('senha').setDescription('Senha única').setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        console.log('🔄 Atualizando comandos globais...');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Comandos atualizados!');
    } catch (error) {
        console.error('❌ Erro ao atualizar comandos:', error);
    }
})();

client.once('ready', () => {
    console.log('✅ Bot está online!');
});

const sendMessage = async (interaction, msg, isEphemeral = false) => {
    try {
        await interaction.followUp({
            content: msg,
            ephemeral: isEphemeral
        });
    } catch (error) {
        console.error(`❌ Erro ao enviar mensagem: ${error.message}`);
    }
};

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    await interaction.deferReply({ ephemeral: true });

    if (interaction.commandName === 'spam') {
        const senha = interaction.options.getString('senha');
        const mensagem = senha && spamMessages[senha] ? spamMessages[senha] : "ADM DORMIU SPAM SUBIU";

        for (let i = 0; i < 10; i++) {
            await interaction.channel.send(mensagem);
        }

        await sendMessage(interaction, 'Spam enviado!', true);
    }

    if (interaction.commandName === 'setspam') {
        if (!allowedUsers.includes(interaction.user.id)) {
            return await sendMessage(interaction, '❌ Você não tem permissão para definir mensagens de spam!', true);
        }
        const senha = interaction.options.getString('senha');
        const mensagem = interaction.options.getString('mensagem');
        spamMessages[senha] = mensagem;
        await sendMessage(interaction, `✅ Mensagem de spam definida para a senha: ${senha}`, true);
    }

    if (interaction.commandName === 'removespam') {
        if (!allowedUsers.includes(interaction.user.id)) {
            return await sendMessage(interaction, '❌ Você não tem permissão para remover mensagens de spam!', true);
        }
        const senha = interaction.options.getString('senha');
        if (spamMessages[senha]) {
            delete spamMessages[senha];
            await sendMessage(interaction, `✅ Mensagem de spam removida para a senha: ${senha}`, true);
        } else {
            await sendMessage(interaction, '❌ Senha não encontrada!', true);
        }
    }
});

client.login(token);
