require('dotenv').config(); // Carregar variáveis de ambiente do .env
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { token, clientId } = process.env;  
const loadCommands = require('./comandos/ban.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ],
});

client.once('ready', () => {
    console.log('Bot está online!');
});

// Função para enviar mensagens
const sendMessage = async (interaction, msg, isEphemeral = false) => {
    try {
        await interaction.followUp({
            content: msg,
            flags: isEphemeral ? MessageFlags.Ephemeral : undefined // Define ephemeral corretamente
        });
    } catch (error) {
        console.error(`Erro ao enviar mensagem: ${error.message}`);
    }
};

// Comando de spam
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'spam') {
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabel('SPAMMER 🇵🇰')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'ADM DORMIU SPAM SUBIU',
            components: [row],
            flags: MessageFlags.Ephemeral // Agora usa flags corretamente
        });
    }
});

// Manipulando a interação do botão
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'spamButton') {
        await interaction.deferUpdate(); // Confirma que o botão foi pressionado

        // Configurações do spam
        const totalMessages = 10;
        let sentMessages = 0;

        await sendMessage(interaction, 'Iniciando spam...', true); // Mensagem inicial em ephemeral

        // Enviar mensagens normalmente
        for (let i = 0; i < totalMessages; i++) {
            await sendMessage(interaction, `
# ПАКИСТАН НА ВЕРХУ
# ||PAKISTAN NÃO TA PURO||
# NOS NO TOPO O RESTO É RANDOM
# https://discord.gg/7CadnxeryD
# @here @everyone
`);
            sentMessages++;
        }

        await sendMessage(interaction, 'O spam foi finalizado!');
    }
});

// Logando o bot
client.login(token);
