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
    new SlashCommandBuilder().setName('spam').setDescription('Iniciar spam'),
    new SlashCommandBuilder().setName('setspam').setDescription('Configurar a mensagem de spam'),
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
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabel('SPAMMER 🇵🇰')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'Clique no botão para iniciar o spam!',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.commandName === 'setspam') {
        if (interaction.user.id !== authorizedId) {
            return await sendMessage(interaction, 'Você não tem permissão para configurar a mensagem de spam!', true);
        }

        const newMessage = interaction.options.getString('message'); // A nova mensagem de spam a ser configurada
        if (!newMessage) {
            return await sendMessage(interaction, 'Você precisa fornecer uma mensagem para configurar o spam!', true);
        }

        spamMessages[interaction.user.id] = newMessage; // Armazenar a mensagem personalizada para o usuário
        await sendMessage(interaction, `Mensagem de spam personalizada configurada com sucesso!`, true);
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'spamButton') {
        await interaction.deferUpdate();

        // Verificar se o usuário tem uma mensagem personalizada ou usar a padrão
        const messageToSpam = spamMessages[interaction.user.id] || spamMessages.default;

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
