const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs')


module.exports = {
    name: 'sugestion',
    async execute(interaction) {
        const emojis = ['✅', '❌']


        if (interaction.isButton()) {
            if (interaction.customId.startsWith("sugestion")) {
              const painel_sugestion = new Discord.ModalBuilder()
                .setCustomId('painelsugestion')
                .setTitle(`Faça sua sugestão ${interaction.user.username}`)
              const sugestion = new Discord.TextInputBuilder()
                .setCustomId('sugestion')
                .setLabel('Digite sua sugestão')
                .setPlaceholder('Escreva a sugestão aqui.')
                .setStyle(Discord.TextInputStyle.Paragraph)
        
              const firstActionRow = new Discord.ActionRowBuilder().addComponents(sugestion);
              painel_sugestion.addComponents(firstActionRow)
              await interaction.showModal(painel_sugestion);
            }
          }

      
          if (!interaction.isModalSubmit()) return;
          if (interaction.customId === 'painelsugestion') {
            const chanel = interaction.guild.channels.cache.get(config.sugestion)
            const sugestao = interaction.fields.getTextInputValue('sugestion');

            const embed= new Discord.EmbedBuilder()
            .setTitle(`Nova Sugestão dê ${interaction.user.username}`)
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setThumbnail(
                `${interaction.user.displayAvatarURL({
                  dynamic: true,
                  format: "png",
                  size: 4096,
                })}`
              )
            .setColor(0x2B2D31)
            .setFooter({ text: "Atenciosamente Next System" })
            .addFields(
                { name: "Sua Sugestão:", value: sugestao}
            )
        
            chanel.send({ embeds: [embed] }).then( (msgg) => {
                        emojis.forEach(emoji => {
                            msgg.react(emoji)
                        })})


            interaction.reply({
                content:"Sua Sugestão foi enviada com sucesso",
                ephemeral:true
            })

            
    }



}}