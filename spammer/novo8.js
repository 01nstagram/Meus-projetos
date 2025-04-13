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
        .addStringOption(option => option.setName('mensagem').setDescription('Mensagem de spam a ser configurada'))
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

    if (interaction.commandName === 'spam') {
        const senha = interaction.options.getString('senha'); // Obtém a senha, se fornecida

        // Define a mensagem a ser enviada (se houver senha configurada)
        const spamMessage = senha ? `Spam personalizado com a senha: ${senha}` : "Mensagem padrão de spam.";

        const button = new ButtonBuilder()
            .setCustomId('startSpam')
            .setLabel('Iniciar Spam')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        // Envia a mensagem com o botão
        await interaction.reply({
            content: 'Iniciando spam...',
            components: [row],
            flags: MessageFlags.Ephemeral // Tornar a resposta visível apenas para o usuário
        });

        // Logando o uso do comando
        await sendLog(interaction, 'spam');
    }

    if (interaction.commandName === 'setspam') {
        const mensagem = interaction.options.getString('mensagem'); // Obtém a nova mensagem de spam

        // Armazena a mensagem de spam configurada
        // (Você pode armazenar isso em um banco de dados ou variável dependendo da sua implementação)
        global.spamMessage = mensagem;

        await sendMessage(interaction, 'Mensagem de spam configurada com sucesso!', true);
        await sendLog(interaction, 'setspam');
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'startSpam') {
        await interaction.deferUpdate();

        const spamMessage = global.spamMessage || "Mensagem padrão de spam."; // Usa a mensagem configurada ou a padrão

        await sendMessage(interaction, 'Iniciando spam...', true);

        const totalMessages = 10; // Defina quantas mensagens você quer que o bot envie
        for (let i = 0; i < totalMessages; i++) {
            await sendMessage(interaction, spamMessage, true);
        }

        await sendMessage(interaction, 'O spam foi finalizado!', true);
    }
});

// 🔑 Logando o bot
client.login(token);
