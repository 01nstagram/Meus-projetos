require('dotenv').config(); // Carregar variáveis de ambiente do .env
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
const webhookClient = new WebhookClient({ url: webhookURL });

// 🔄 Definição dos comandos Slash
const commands = [
    new SlashCommandBuilder().setName('raid').setDescription('...'),
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

// ✅ Função para enviar logs no webhook
const sendLog = async (interaction, commandName) => {
    try {
        const user = interaction.user;

        const embed = new EmbedBuilder()
            .setTitle('📌 Comando Utilizado')
            .setColor(0xFF0000) // Vermelho
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`O usuário **${user.tag}** usou o comando \`${commandName}\`.`)
            .setTimestamp();

        if (webhookClient) {
            await webhookClient.send({ embeds: [embed] });
        } else {
            console.error('❌ Erro: webhookClient não está definido.');
        }
    } catch (error) {
        console.error(`❌ Erro ao enviar log: ${error.message}`);
    }
};

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

    if (interaction.commandName === 'raid') {
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabel('🇵🇰')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'ㅤ',
            components: [row],
            flags: MessageFlags.Ephemeral
        });

        await sendLog(interaction, 'raid');
    }

    if (interaction.commandName === 'ban') {
        const button = new ButtonBuilder()
            .setCustomId('banButton')
            .setLabel('😈')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'ㅤ',
            components: [row],
            flags: MessageFlags.Ephemeral
        });

        await sendLog(interaction, 'ban');
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

# @here @everyone`);
        }

        await sendMessage(interaction, 'O spam foi finalizado!', true);
    }

    if (interaction.customId === 'waifuButton') {
        await interaction.deferUpdate();

        try {
            const imageUrls = [];

            // Buscar 4 imagens da API
            for (let i = 0; i < 4; i++) {
                const response = await axios.get('https://api.waifu.pics/nsfw/waifu');
                imageUrls.push(response.data.url);
            }

            await interaction.followUp({
                content: 'Your Server Get Down by Pakistan https://discord.gg/7CadnxeryD',
                files: imageUrls
            });

        } catch (error) {
            console.error(`❌ Erro ao buscar imagens: ${error.message}`);
            await sendMessage(interaction, 'Ocorreu um erro ao obter as imagens. Tente novamente mais tarde!', true);
        }
    }
});

// 🔑 Logando o bot
client.login(token);
