require('dotenv').config(); // Carregar variáveis de ambiente do .env
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, EmbedBuilder, REST, Routes, SlashCommandBuilder, Collection } = require('discord.js');

const { token, clientId, authorizedId } = process.env; // ID autorizado para setar mensagens

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();

// 🔄 Definição dos comandos Slash
const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Iniciar spam')
        .addStringOption(option => option.setName('senha').setDescription('Digite a senha (opcional)')),
    new SlashCommandBuilder().setName('setspam').setDescription('Configurar a mensagem de spam')
        .addStringOption(option => option.setName('senha').setDescription('Senha para configurar a mensagem'))
        .addStringOption(option => option.setName('mensagem').setDescription('Mensagem de spam a ser configurada'))
].map(command => command.toJSON());

// 🔄 Atualizar comandos automaticamente ao iniciar
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        console.log('🔄 Atualizando comandos...');
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

// 🔄 Armazenando senhas e mensagens de spam
const spamMessages = {}; // {senha: mensagem}
const spamSessions = new Map(); // {userId: { senha, mensagem }}

// 📜 Comando /spam
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'spam') {
        const senha = interaction.options.getString('senha'); // Obtém a senha, se fornecida

        // Verifica se a senha está configurada
        const spamMessage = senha ? spamMessages[senha] : "Mensagem padrão de spam.";

        if (senha && !spamMessage) {
            await interaction.reply({ content: 'Senha inválida! Tente novamente.', ephemeral: true });
            return;
        }

        const button = new ButtonBuilder()
            .setCustomId(`startSpam_${interaction.user.id}`)
            .setLabel('Iniciar Spam')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        // Salvar sessão para o usuário
        spamSessions.set(interaction.user.id, { senha, mensagem: spamMessage });

        // Envia a mensagem com o botão
        await interaction.reply({
            content: 'Iniciando spam...',
            components: [row],
            ephemeral: true
        });
    }

    if (interaction.commandName === 'setspam') {
        const senha = interaction.options.getString('senha');
        const mensagem = interaction.options.getString('mensagem');

        if (interaction.user.id !== authorizedId) {
            await interaction.reply({ content: 'Você não tem permissão para configurar mensagens de spam.', ephemeral: true });
            return;
        }

        spamMessages[senha] = mensagem;

        await interaction.reply({ content: 'Mensagem de spam configurada com sucesso!', ephemeral: true });
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    if (!spamSessions.has(userId)) {
        await interaction.reply({ content: 'Erro: Nenhuma sessão de spam encontrada.', ephemeral: true });
        return;
    }

    await interaction.deferUpdate();

    const { senha, mensagem } = spamSessions.get(userId);

    for (let i = 0; i < 10; i++) {
        await interaction.channel.send(mensagem);
    }

    await interaction.followUp({ content: 'Spam concluído!', ephemeral: true });
});

// 🔑 Logando o bot
client.login(token);
