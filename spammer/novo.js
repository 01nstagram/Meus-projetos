require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    Collection, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags 
} = require('discord.js');

const { token, clientId } = process.env;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

client.commands = new Collection();
const senhas = new Map(); // Armazena senhas e mensagens personalizadas
const idsAutorizados = ['1247674238102405262']; // IDs autorizados para administrar senhas
const mensagemPadrao = "Mensagem padrão de spam.";

const commands = [
    new SlashCommandBuilder()
        .setName('spam')
        .setDescription('Envia mensagens de spam.'),
    new SlashCommandBuilder()
        .setName('setspam')
        .setDescription('Define uma mensagem de spam para uma senha.')
        .addStringOption(option => 
            option.setName('senha')
                .setDescription('Senha para definir a mensagem')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mensagem')
                .setDescription('Mensagem personalizada para spam')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('addsenha')
        .setDescription('Adiciona uma senha.')
        .addStringOption(option => 
            option.setName('senha')
                .setDescription('Senha a ser adicionada')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('removersenha')
        .setDescription('Remove uma senha.')
        .addStringOption(option => 
            option.setName('senha')
                .setDescription('Senha a ser removida')
                .setRequired(true))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log('✅ Bot online! Atualizando comandos...');
    try {
        const rest = new (require('@discordjs/rest').REST)({ version: '10' }).setToken(token);
        await rest.put(require('discord-api-types/v10').Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Comandos atualizados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar comandos:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply({ ephemeral: true });

    const { commandName, options, user } = interaction;
    if (commandName === 'spam') {
        if (!interaction.channel) return interaction.followUp('Erro: Canal inválido.');
        await interaction.followUp('Iniciando spam...');
        const mensagem = mensagemPadrao;
        for (let i = 0; i < 10; i++) {
            await interaction.channel.send(mensagem);
        }
        await interaction.followUp('Spam finalizado!');
    }
    
    if (commandName === 'setspam') {
        const senha = options.getString('senha');
        const mensagem = options.getString('mensagem');
        if (!senhas.has(senha)) return interaction.followUp('Senha inválida!');
        senhas.set(senha, mensagem);
        await interaction.followUp('Mensagem de spam configurada!');
    }

    if (commandName === 'addsenha') {
        if (!idsAutorizados.includes(user.id)) return interaction.followUp('Você não tem permissão para adicionar senhas.');
        const senha = options.getString('senha');
        senhas.set(senha, mensagemPadrao);
        await interaction.followUp(`Senha ${senha} adicionada!`);
    }

    if (commandName === 'removersenha') {
        if (!idsAutorizados.includes(user.id)) return interaction.followUp('Você não tem permissão para remover senhas.');
        const senha = options.getString('senha');
        if (!senhas.has(senha)) return interaction.followUp('Senha não encontrada.');
        senhas.delete(senha);
        await interaction.followUp(`Senha ${senha} removida!`);
    }
});

client.login(token);
