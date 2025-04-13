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
        .addStringOption(option => option.setName('senha').setDescription('Senha para configurar a mensagem'))
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

// 🔄 Armazenando senhas e mensagens de spam
const spamMessages = {}; // {senha: mensagem}

// ✅ Função para enviar logs no webhook
const sendLog = async (interaction, commandName, details = '') => {
    try {
        const user = interaction.user;

        const embed = new EmbedBuilder()
            .setTitle('📌 Comando Utilizado')
            .setColor(0xFF0000) // Vermelho
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`O usuário **${user.tag}** usou o comando \`${commandName}\`.`)
            .addFields({ name: 'Detalhes', value: details })
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

        // Verifica se a senha está configurada
        const spamMessage = senha ? spamMessages[senha] : "Mensagem padrão de spam.";

        // Caso a senha não exista, avisa o usuário
        if (senha && !spamMessage) {
            await sendMessage(interaction, 'Senha inválida! A senha fornecida não está configurada.', true);
            return;
        }

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
        await sendLog(interaction, 'spam', `Senha usada: ${senha ? senha : 'Nenhuma'}`);
    }

    if (interaction.commandName === 'setspam') {
        const senha = interaction.options.getString('senha'); // Obtém a senha para configurar
        const mensagem = interaction.options.getString('mensagem'); // Obtém a nova mensagem de spam

        // Verifica se o usuário tem permissão para configurar a senha
        if (interaction.user.id !== authorizedId) {
            await sendMessage(interaction, 'Você não tem permissão para configurar as mensagens de spam.', true);
            return;
        }

        // Armazena a senha e a mensagem configurada
        spamMessages[senha] = mensagem;

        await sendMessage(interaction, 'Mensagem de spam configurada com sucesso!', true);

        // Logando a configuração de senha
        await sendLog(interaction, 'setspam', `Senha configurada: ${senha} | Mensagem: ${mensagem}`);
    }
});

// 📜 Manipulação dos botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'startSpam') {
        await interaction.deferUpdate();

        const senha = interaction.options.getString('senha'); // Obtém a senha, se fornecida
        const spamMessage = senha ? spamMessages[senha] : "Mensagem padrão de spam."; // Usa a mensagem configurada ou a padrão

        if (!spamMessage) {
            await sendMessage(interaction, 'Nenhuma mensagem configurada para a senha fornecida. Spam não iniciado.', true);
            return;
        }

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
