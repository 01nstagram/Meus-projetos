require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const botToken = process.env.BOT_TOKEN; // Carrega o token do bot
const clientId = process.env.CLIENT_ID; // Carrega o ID do bot

let sayEnabled = false;  // Flag para controlar se o "say" está ativado ou desativado

const commands = [
    new SlashCommandBuilder().setName('ban').setDescription('Banir um usuário do servidor')
        .addUserOption(option => option.setName('user').setDescription('Usuário a ser banido').setRequired(true)),
    new SlashCommandBuilder().setName('nuker').setDescription('Clonar o canal e apagar o antigo')
        .addChannelOption(option => option.setName('channel').setDescription('Canal a ser nukado').setRequired(true)),
    new SlashCommandBuilder().setName('say').setDescription('Envie uma mensagem como embed')
        .addStringOption(option => option.setName('message').setDescription('Mensagem a ser enviada').setRequired(true)),
    new SlashCommandBuilder().setName('saytoggle').setDescription('Ativar ou desativar o comando say'),
];

// Atualizar os comandos no Discord
async function updateCommands() {
    const rest = new REST({ version: '10' }).setToken(botToken);

    try {
        console.log('Atualizando comandos...');
        
        // Registrar os comandos globalmente
        await rest.put(Routes.applicationCommands(clientId), {
            body: commands.map(command => command.toJSON()),
        });

        console.log('Comandos atualizados com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar comandos: ', error);
    }
}

// Quando o bot estiver pronto
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
    updateCommands();  // Chama a função para atualizar os comandos ao inicializar o bot
});

// Comando ban
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const member = interaction.member;
    const target = interaction.options.getUser('user');
    
    if (interaction.commandName === 'ban') {
        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'Você não tem permissões para banir membros.', ephemeral: true });
        }
        
        const targetMember = interaction.guild.members.cache.get(target.id);

        if (targetMember) {
            try {
                await targetMember.ban({ reason: 'Banido pelo bot' });
                return interaction.reply({ content: `${target.tag} foi banido do servidor.`, ephemeral: true });
            } catch (error) {
                console.error('Erro ao banir o membro:', error);
                return interaction.reply({ content: 'Houve um erro ao tentar banir o usuário.', ephemeral: true });
            }
        } else {
            return interaction.reply({ content: 'Não encontrei esse usuário no servidor.', ephemeral: true });
        }
    }

    // Comando nuker
    if (interaction.commandName === 'nuker') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'Você não tem permissões para gerenciar canais.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        
        if (channel) {
            try {
                // Clonar o canal
                const clonedChannel = await channel.clone();

                // Deletar o canal original
                await channel.delete();

                // Enviar mensagem no novo canal clonado
                const embed = new EmbedBuilder()
                    .setTitle('Canal Nuked')
                    .setDescription(`O canal ${channel.name} foi clonado e o antigo foi deletado.`)
                    .addFields({ name: 'Executado por', value: `${interaction.user.tag}` })
                    .setColor('#FF0000')
                    .setTimestamp();

                await clonedChannel.send({ embeds: [embed] });

                return interaction.reply({ content: `O canal ${channel.name} foi nukeado e clonado com sucesso!`, ephemeral: true });
            } catch (error) {
                console.error('Erro ao nukear o canal:', error);
                return interaction.reply({ content: 'Houve um erro ao tentar nuke o canal.', ephemeral: true });
            }
        } else {
            return interaction.reply({ content: 'Não encontrei esse canal no servidor.', ephemeral: true });
        }
    }

    // Comando say
    if (interaction.commandName === 'say') {
        if (!sayEnabled) {
            return interaction.reply({ content: 'O comando Say está desativado no momento.', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        
        const embed = new EmbedBuilder()
            .setTitle('Mensagem do Bot')
            .setDescription(message)
            .setColor('#00FF00')
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    // Comando saytoggle
    if (interaction.commandName === 'saytoggle') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: 'Você não tem permissões para alterar a configuração do say.', ephemeral: true });
        }

        // Alternar o estado de sayEnabled
        sayEnabled = !sayEnabled;
        
        return interaction.reply({
            content: `O comando Say foi ${sayEnabled ? 'ativado' : 'desativado'}.`,
            ephemeral: true,
        });
    }
});

// Iniciar o bot
client.login(botToken);
