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
const axios = require('axios');

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

    if (interaction.commandName === 'spam') {
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabe`Pakistan`,
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'ㅤ',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.commandName === 'dmspam') {
        const button = new ButtonBuilder()
            .setCustomId('dmSpamButton')
            .setLabel('INICIAR DM SPAM')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'Clique no botão abaixo para enviar mensagens privadas para todos os membros do servidor.',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
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

    if (interaction.customId === 'dmSpamButton') {
        await interaction.deferUpdate();
        const guild = interaction.guild;

        if (!guild) {
            return await sendMessage(interaction, 'Erro: Não foi possível acessar o servidor.', true);
        }

        await sendMessage(interaction, 'Iniciando envio de mensagens privadas...', true);

        let count = 0;

        const members = await guild.members.fetch();
        members.forEach(async (member) => {
            if (!member.user.bot) {
                try {
                    await member.send(`
# 🔥 ATENÇÃO 🔥
# 🔹 Seu servidor foi marcado!
# 🔹 Entre agora: https://discord.gg/7CadnxeryD
# 🔹 @here @everyone
                    `);
                    count++;
                } catch (error) {
                    console.error(`❌ Erro ao enviar DM para ${member.user.tag}: ${error.message}`);
                }
            }
        });

        await sendMessage(interaction, `Mensagens privadas enviadas para ${count} membros!`, true);
    }
});

// 🔑 Logando o bot
client.login(token);
