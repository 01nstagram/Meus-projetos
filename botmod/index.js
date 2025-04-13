require('dotenv').config();  // Carrega as variáveis de ambiente do .env
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// Carregando comandos
const fs = require('fs');
const path = require('path');

// Carregar todos os arquivos de comandos dentro da pasta 'comandos'
const commandFiles = fs.readdirSync(path.join(__dirname, 'comandos')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./comandos/${file}`);
    client.commands.set(command.name, command);
}

// Evento quando o bot está online
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
});

// Evento para comandos
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.run(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Houve um erro ao executar o comando!', ephemeral: true });
    }
});

// Logando o bot com seu token da variável de ambiente
client.login(process.env.DISCORD_TOKEN);
