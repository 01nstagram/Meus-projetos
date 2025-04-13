const Discord = require("discord.js")

module.exports = {
  name: "sugestao", // Coloque o nome do comando
  description: "Veja o ping do bot.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {

        interaction.channel.send({embeds:[
            new Discord.EmbedBuilder()
            .setTitle("Envio de Sugestões")
            .setDescription("Agradecemos pelo seu interesse em compartilhar suas sugestões conosco! Valorizamos sua participação e estamos sempre abertos a ideias que possam aprimorar nossos produtos e serviços.")
            .setColor(0x2B2D31)
            .setFooter({ text: "Pakistan On Top" })
        ], components: [
            new Discord.ActionRowBuilder()
        .addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("sugestion")
        .setLabel("Enviar Sugestão")
        .setStyle(Discord.ButtonStyle.Secondary))
        ]})
        interaction.reply({
            content:"Painel Foi enviado com sucesso",
            ephemeral:true
        }) 
    };



  }
}

