require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Collection, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const { token, clientId } = process.env;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

client.commands = new Collection();
const senhaConfig = new Map(); // Armazena senha -> mensagem personalizada

// Definição dos comandos Slash
const commands = [
    new SlashCommandBuilder()
        .setName('spam')
        .setDescription('Executa spam no canal. Pode usar senha para mensagem personalizada.')
        .addStringOption(option => 
            option.setName('senha')
                .setDescription('Senha para usar mensagem personalizada.')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('setspam')
        .setDescription('Define uma senha e mensagem personalizada para spam.')
        .addStringOption(option => 
            option.setName('senha')
                .setDescription('Senha para vincular à mensagem.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('mensagem')
                .setDescription('Mensagem de spam personalizada.')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('removespam')
        .setDescription('Remove uma senha de spam personalizada.')
        .addStringOption(option => 
            option.setName('senha')
                .setDescription('Senha a ser removida.')
                .setRequired(true)
        )
].map(command => command.toJSON());

// Atualizar comandos
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        console.log('🔄 Atualizando comandos...');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Comandos atualizados!');
    } catch (error) {
        console.error('❌ Erro ao atualizar comandos:', error);
    }
})();

client.once('ready', () => {
    console.log('✅ Bot está online!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply({ ephemeral: true });

    const { commandName, options, channelId } = interaction;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return interaction.editReply('❌ Canal inválido.');

    if (commandName === 'spam') {
        const senha = options.getString('senha');
        let mensagem = "# SPAM PADRÃO\n# ENTRE: https://discord.gg/7CadnxeryD\n@here @everyone";
        
        if (senha && senhaConfig.has(senha)) {
            mensagem = senhaConfig.get(senha);
        }
        
        const button = new ButtonBuilder()
            .setCustomId('spamButton')
            .setLabel('INICIAR SPAM')
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder().addComponents(button);
        
        await interaction.editReply({
            content: 'Clique no botão para iniciar o spam.',
            components: [row]
        });
    }

    if (commandName === 'setspam') {
        const senha = options.getString('senha');
        const mensagem = options.getString('mensagem');
        senhaConfig.set(senha, mensagem);
        await interaction.editReply(`✅ Senha **${senha}** configurada com a mensagem personalizada!`);
    }

    if (commandName === 'removespam') {
        const senha = options.getString('senha');
        if (senhaConfig.has(senha)) {
            senhaConfig.delete(senha);
            await interaction.editReply(`✅ Senha **${senha}** removida!`);
        } else {
            await interaction.editReply('❌ Senha não encontrada.');
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'spamButton') {
        await interaction.deferUpdate();
        const channel = await client.channels.fetch(interaction.channelId).catch(() => null);
        if (!channel) return;

        for (let i = 0; i < 5; i++) {
            await channel.send('# SPAM ATIVO 🚀\n@here @everyone');
        }
    }
});

client.login(token);
