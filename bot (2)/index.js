const Discord = require("discord.js")

const config = require("./config.json")

const client = new Discord.Client({ 
  intents: [ 
Discord.GatewayIntentBits.Guilds
       ]
    });

module.exports = client

client.on('interactionCreate', (interaction) => {

  if(interaction.type === Discord.InteractionType.ApplicationCommand){

      const cmd = client.slashCommands.get(interaction.commandName);

      if (!cmd) return interaction.reply(`Error`);

      interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

      cmd.run(client, interaction)

   }
})

client.on('ready', () => {
  console.log(`🔥 Estou online em ${client.user.username}!`)
})


client.slashCommands = new Discord.Collection()

require('./handler')(client)

client.on("interactionCreate", require('./events/sugestion').execute);
client.on("interactionCreate", require('./events/termos').execute);
client.on("interactionCreate", require('./events/selectmenuticket').execute);
client.on("interactionCreate", require('./events/ticketsystem').execute);
client.on("interactionCreate", require('./events/buttonsticket').execute);

client.login(config.token)

// Créditos Breack_#8364
