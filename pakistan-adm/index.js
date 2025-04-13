const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

// Carregar comandos
const commandFolders = fs.readdirSync('./comandos');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./comandos/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./comandos/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// Sistema de comandos
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Erro no comando.', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`BOT ONLINE COMO ${client.user.tag}`);
});

client.login(process.env.TOKEN);