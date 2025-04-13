require('dotenv').config();
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, EmbedBuilder, REST, Routes, SlashCommandBuilder, Collection, WebhookClient } = require('discord.js');
const axios = require('axios');

const { token, clientId, webhookURL } = process.env;

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
const webhookClient = webhookURL ? new WebhookClient({ url: webhookURL }) : null;

// 🔄 Definição dos comandos Slash
const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Ativa o spam'),
    new SlashCommandBuilder().setName('ban').setDescription('Exibe botão de banimento')
].map(command => command.toJSON());

// 🔄 Atualizar comandos automaticamente
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
client.once('ready', () => console.log('✅ Bot está online!'));

// ✅ Função para enviar logs no webhook
const sendLog = async (interaction, commandName) => {
    if (!webhookClient) return;
    try {
        const user = interaction.user;
        const embed = new EmbedBuilder()
            .setTitle('📌 Comando Utilizado')
            .setColor(0xFF0000)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`O usuário **${user.tag}** usou o comando \`${commandName}\`.`)
            .setTimestamp();
        await webhookClient.send({ embeds: [embed] });
    } catch (error) {
        console.error(`❌ Erro ao enviar log: ${error.message}`);
    }
};

// ✅ Função segura para enviar mensagens
const sendMessage = async (interaction, msg, isEphemeral = false) => {
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: msg, ephemeral: isEphemeral });
        } else {
            await interaction.reply({ content: msg, ephemeral: isEphemeral });
        }
    } catch (error) {
        console.error(`❌ Erro ao enviar mensagem: ${error.message}`);
    }
};

// 📜 Comandos Slash
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'spam') {
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabel('SPAMMER')
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder().addComponents(button);
        await interaction.reply({ content: 'Clique no botão para iniciar o spam.', components: [row], ephemeral: true });
        await sendLog(interaction, 'spam');
    }
    
    if (interaction.commandName === 'ban') {
        const button = new ButtonBuilder()
            .setCustomId('banButton')
            .setLabel('BANIR')
            .setStyle(ButtonStyle.Danger);
        
        const row = new ActionRowBuilder().addComponents(button);
        await interaction.reply({ content: 'Clique no botão para banir.', components: [row], ephemeral: true });
        await sendLog(interaction, 'ban');
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'spamButton') {
        await interaction.deferUpdate();
        const totalMessages = 10;
        await sendMessage(interaction, 'Iniciando spam...', true);
        
        for (let i = 0; i < totalMessages; i++) {
            await sendMessage(interaction, 'Mensagem de spam exemplo');
        }
        await sendMessage(interaction, 'O spam foi finalizado!', true);
    }

    if (interaction.customId === 'banButton') {
        await interaction.deferUpdate();
        await sendMessage(interaction, 'Você clicou no botão de banimento!', true);
    }
});

// 🔑 Logando o bot
client.login(token);
