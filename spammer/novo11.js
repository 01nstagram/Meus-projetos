require('dotenv').config();
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, EmbedBuilder, REST, Routes, SlashCommandBuilder, Collection } = require('discord.js');

const { token, clientId, authorizedId } = process.env;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();

const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Iniciar spam')
        .addStringOption(option => option.setName('senha').setDescription('Digite a senha (opcional)')),
    new SlashCommandBuilder().setName('setspam').setDescription('Configurar a mensagem de spam')
        .addStringOption(option => option.setName('senha').setDescription('Senha para configurar a mensagem'))
        .addStringOption(option => option.setName('mensagem').setDescription('Mensagem de spam a ser configurada'))
].map(command => command.toJSON());

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

client.once('ready', () => {
    console.log('✅ Bot está online!');
});

const spamMessages = {};
const spamSessions = new Map();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'spam') {
        const senha = interaction.options.getString('senha');
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

        spamSessions.set(interaction.user.id, { senha, mensagem: spamMessage, canal: interaction.channel });

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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    if (!spamSessions.has(userId)) {
        await interaction.reply({ content: 'Erro: Nenhuma sessão de spam encontrada.', ephemeral: true });
        return;
    }

    await interaction.deferUpdate();

    const { senha, mensagem, canal } = spamSessions.get(userId);

    if (!canal) {
        await interaction.followUp({ content: 'Erro: Não foi possível acessar o canal para enviar spam.', ephemeral: true });
        return;
    }

    try {
        for (let i = 0; i < 10; i++) {
            await canal.send(mensagem);
        }

        await interaction.followUp({ content: 'Spam concluído!', ephemeral: true });
    } catch (error) {
        console.error('❌ Erro ao enviar spam:', error);
        await interaction.followUp({ content: 'Erro ao enviar mensagens. Verifique as permissões do bot!', ephemeral: true });
    }
});

client.login(token);
