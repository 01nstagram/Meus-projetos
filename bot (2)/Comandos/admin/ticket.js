const Discord = require("discord.js")

module.exports = {
  name: "ticket", // Coloque o nome do comando
  description: "abra um painel ticket", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {


    
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {



        interaction.reply({
            content:"aberto com Sucesso",
            ephemeral: true
        })
        interaction.channel.send({
            embeds:[
                new Discord.EmbedBuilder()
                .setTitle("Pakistan Team")
                .setDescription("👋 | Caso precise abrir um ticket, selecione uma das opções abaixo:")
                .setColor("Blurple")
            ],
        components: [
          new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
              .setCustomId("options_member")
              .setPlaceholder("Escolha uma opção!")
              .addOptions(
                {
              label: "Suporte",
              value: `suporte`,
            },
            {
                label: "Reportar algo",
                value: `report`,
              },
              {
                label: "Duvida",
                value: `duvida`,
              }
            ))
        ]})
        

    }

    
  }
}
