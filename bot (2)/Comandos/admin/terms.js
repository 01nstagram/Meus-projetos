const Discord = require("discord.js")

module.exports = {
  name: "termos", // Coloque o nome do comando
  description: "nossos termos", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,


  run: async (client, interaction) => {

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {
        interaction.reply({
            content:"enviado com sucesso",
            ephemeral: true
        })

        interaction.channel.send({
            embeds:[
                new Discord.EmbedBuilder()
                .setTitle("Nossos Termos")
                .setDescription("Aqui estão os botões para facilitar a leitura, clique de acordo com oque você precisa saber ||Recomendaria ver todos para evitar confusões futuras||")
                .setColor("Default")
            ],
            components:[
                new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId("mix")
                    .setLabel("Tabela de Preço")
                    .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                    .setCustomId("regras")
                    .setLabel("Regras")
                    .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                    .setCustomId("reembolso")
                    .setLabel("Reembolso")
                    .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                    .setCustomId("prazo")
                    .setLabel("Prazo")
                    .setStyle(Discord.ButtonStyle.Secondary)
                )
            ]
        })
        
    }




}

}