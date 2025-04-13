require('dotenv').config();
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder, Collection, PermissionsBitField } = require('discord.js');

const { token, clientId, authorizedId } = process.env;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();

// 🔄 Definição dos comandos
const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Iniciar spam')
        .addStringOption(option => option.setName('senha').setDescription('Senha (opcional)')),
    new SlashCommandBuilder().setName('setspam').setDescription('Configurar mensagem de spam')
        .addStringOption(option => option.setName('senha').setDescription('Senha para salvar a mensagem'))
        .addStringOption(option => option.setName('mensagem').setDescription('Mensagem de spam a ser usada')),
].map(command => command.toJSON());

// 🔄 Atualizar comandos automaticamente
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

// 📜 Armazena mensagens de spam configuradas
const spamMessages = {};
const spamSessions = new Map();

// 📜 Comando /spam
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'spam') {
        const senha = interaction.options.getString('senha');
        const spamMessage = senha ? spamMessages[senha] : "Mensagem padrão de spam.";

        if (senha && !spamMessage) {
            await interaction.reply({ content: '❌ Senha inválida! Tente novamente.', ephemeral: true });
            return;
        }

        const button = new ButtonBuilder()
            .setCustomId(`startSpam_${interaction.user.id}`)
            .setLabel('Iniciar Spam')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        spamSessions.set(interaction.user.id, { senha, mensagem: spamMessage, canalId: interaction.channelId });

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
            await interaction.reply({ content: '❌ Você não tem permissão para configurar mensagens de spam.', ephemeral: true });
            return;
        }

        if (!senha || !mensagem) {
            await interaction.reply({ content: '❌ Você precisa fornecer uma senha e uma mensagem.', ephemeral: true });
            return;
        }

        spamMessages[senha] = mensagem;
        await interaction.reply({ content: '✅ Mensagem de spam configurada com sucesso!', ephemeral: true });
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    if (!spamSessions.has(userId)) {
        await interaction.reply({ content: '❌ Erro: Nenhuma sessão de spam encontrada.', ephemeral: true });
        return;
    }

    await interaction.deferUpdate();

    const { senha, mensagem, canalId } = spamSessions.get(userId);
    const canal = await client.channels.fetch(canalId).catch(() => null);

    if (!canal || !canal.send) {
        await interaction.followUp({ content: '❌ Erro: Não foi possível acessar o canal para enviar spam.', ephemeral: true });
        return;
    }

    if (!canal.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
        await interaction.followUp({ content: '❌ Erro: O bot não tem permissão para enviar mensagens neste canal.', ephemeral: true });
        return;
    }

    try {
        for (let i = 0; i < 10; i++) {
            await canal.send(mensagem);
        }

        await interaction.followUp({ content: '✅ Spam concluído!', ephemeral: true });
    } catch (error) {
        console.error('❌ Erro ao enviar spam:', error);
        await interaction.followUp({ content: '❌ Erro ao enviar mensagens. Verifique as permissões do bot!', ephemeral: true });
    }
});

client.login(token);
