require('dotenv').config(); // Carregar variáveis de ambiente do .env
const { 
    Client, 
    GatewayIntentBits, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle, 
    MessageFlags, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    Collection 
} = require('discord.js');

const { token, clientId } = process.env;  

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
    ],
});

client.commands = new Collection();

// 🔄 Definição dos comandos Slash
const commands = [
    new SlashCommandBuilder()
        .setName('spam')
        .setDescription('...'),

    new SlashCommandBuilder()
        .setName('chkspam')
        .setDescription('...')
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

// ✅ Função segura para enviar mensagens (evita que o bot trave)
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

    // Defere a resposta para garantir que o bot não trave
    await interaction.deferReply();

    if (interaction.commandName === 'spam') {
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabel('SPAMMER 🇵🇰')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.followUp({
            content: 'ADM DORMIU SPAM SUBIU',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.commandName === 'chkspam') {
        // Verifica se a interação é em um canal de texto e se o canal é válido
        const channel = interaction.channel;
        if (!channel || channel.type !== 'GUILD_TEXT') {
            return await sendMessage(interaction, 'GG', true);
        }

        await sendMessage(interaction, `GG`, true);
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'spamButton') {
        await interaction.deferUpdate();

        // Configuração do spam
        const totalMessages = 10;

        await sendMessage(interaction, 'Iniciando spam...', true);

        for (let i = 0; i < totalMessages; i++) {
            await sendMessage(interaction, `
# ПАКИСТАН НА ВЕРХУ
# ||PAKISTAN NÃO TA PURO||
# NOS NO TOPO O RESTO É RANDOM
# https://discord.gg/7CadnxeryD
# @here @everyone
`);
        }

        await sendMessage(interaction, 'O spam foi finalizado!', true);
    }
});

// 🔑 Logando o bot
client.login(token);
