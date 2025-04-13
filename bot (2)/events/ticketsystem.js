const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs')


module.exports = {
    name: 'ticket',
    async execute(interaction) {

            const channel = interaction.guild.channels.cache.find(
              (c) =>
                c.name ===
                `🎫-${interaction.user.username.toLowerCase().replace(/ /g, "-")}`
            );
      
            if (channel)
              return interaction.reply({
                embeds: [
                  new Discord.EmbedBuilder()
                    .setColor("Default")
                    .setDescription(
                      `<a:errado1:1124475561545318462> | Você já possui um ticket aberto em ${channel}.`
                    ),
                ],
                ephemeral: true,
              });
              else {


        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_ticket"
          ) {
        
            const motivo = interaction.fields.getTextInputValue('duvida_ticket');
             const channel = await interaction.guild.channels.create({
                name: `🎫-${interaction.user.username}`,
                type: 0,
                parent: config.ticket.categoria,
                permissionOverwrites: [
                  {
                    id: interaction.guild.id,
                    deny: ["ViewChannel"],
                  },
                  {
                    id: interaction.user.id,
                    allow: [
                      "ViewChannel",
                      "SendMessages",
                      "AttachFiles",
                      "AddReactions",
                    ],
                  },
                  {
                    id: "1145203331518693437",
                    allow: [
                      "ViewChannel",
                      "SendMessages",
                      "AttachFiles",
                      "AddReactions",
                    ],},],});
                    interaction.reply({
                        embeds: [
                          new Discord.EmbedBuilder()
                            .setColor("Blurple")
                            .setDescription(
                              `Olá ${interaction.user}, Seu ticket criado com sucesso em ${channel}.`
                            ),
                        ],
                        ephemeral: true,
                        components: [
                            new Discord.ActionRowBuilder().addComponents(
                              new Discord.ButtonBuilder()
                                .setEmoji("🔗")
                                .setLabel("Acessar ticket")
                                .setStyle(5)
                                .setURL(`${channel.url}`)
                            ),
                          ],
                          components: [
                            new Discord.ActionRowBuilder().addComponents(
                              new Discord.ButtonBuilder()
                                .setEmoji("🔗")
                                .setLabel("Acessar ticket")
                                .setStyle(5)
                                .setURL(`${channel.url}`)
                            ),
                          ],
                      });
                      channel.send({
                        content:"@everyone",
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle("White Hats | Ticket")
                            .setDescription(`Seja Bem Vindo(a) ao seu ticket \n \n Duvida  \n \n \`INFORMAÇÃO IMPORTANTE\` \n \n Os **TICKETS** São Totalmente privados, apenas Membros da **STAFF** Possuem acesso A Este Canal. \n \n Evite **MARCAÇÕES**, Aguarde até que um staff venha lhe atender \n \n Ticket assumido por:  \n \n  Este Canal é destinado para o seu **SUPORTE**, Seja Livre Para Dizer O que Precisa!`)
                            .setColor("Aqua"),
                        ],
                        components:[
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                  .setLabel("Fechar Ticket")
                                  .setStyle(Discord.ButtonStyle.Danger)
                                  .setCustomId("fechar_ticket"),
                                new Discord.ButtonBuilder()
                                .setLabel("Assumir Ticket")
                                .setStyle(2)
                                .setCustomId("assumir_duvida"),
                                new Discord.ButtonBuilder()
                                .setCustomId("painel_staff")
                                .setLabel("Painel Staff")
                                .setStyle(2),
                              ),
                        ],

                      })
                      channel.send({embeds:[
                        new Discord.EmbedBuilder()
                        .addFields({
                            name: `motivo do Usuario`,
                            value: `\`\`\` ${motivo} \`\`\``
                        })
                    ]})
          }

          if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_ticket1"
          ) {
        
            const motivo = interaction.fields.getTextInputValue('suport_ticket');
             const channel = await interaction.guild.channels.create({
                name: `🎫-${interaction.user.username}`,
                type: 0,
                parent: config.ticket.categoria,
                permissionOverwrites: [
                  {
                    id: interaction.guild.id,
                    deny: ["ViewChannel"],
                  },
                  {
                    id: interaction.user.id,
                    allow: [
                      "ViewChannel",
                      "SendMessages",
                      "AttachFiles",
                      "AddReactions",
                    ],
                  },
                  {
                    id: "1145203331518693437",
                    allow: [
                      "ViewChannel",
                      "SendMessages",
                      "AttachFiles",
                      "AddReactions",
                    ],},],});
                    interaction.reply({
                        embeds: [
                          new Discord.EmbedBuilder()
                            .setColor("Blurple")
                            .setDescription(
                              `Olá ${interaction.user}, Seu ticket criado com sucesso em ${channel}.`
                            ),
                        ],
                        ephemeral: true,
                        components: [
                            new Discord.ActionRowBuilder().addComponents(
                              new Discord.ButtonBuilder()
                                .setEmoji("🔗")
                                .setLabel("Acessar ticket")
                                .setStyle(5)
                                .setURL(`${channel.url}`)
                            ),
                          ],
                      });
                      channel.send({
                        content:"@everyone",
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle("White Hats | Ticket")
                            .setDescription(`Seja Bem Vindo(a) ao seu ticket \n \n Support  \n \n \`INFORMAÇÃO IMPORTANTE\` \n \n Os **TICKETS** São Totalmente privados, apenas Membros da **STAFF** Possuem acesso A Este Canal. \n \n Evite **MARCAÇÕES**, Aguarde até que um staff venha lhe atender \n \n Ticket assumido por:  \n \n  Este Canal é destinado para o seu **SUPORTE**, Seja Livre Para Dizer O que Precisa!`)
                            .setColor("Aqua"),
                        ],
                        components:[
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                  .setLabel("Fechar Ticket")
                                  .setStyle(Discord.ButtonStyle.Danger)
                                  .setCustomId("fechar_ticket"),
                                new Discord.ButtonBuilder()
                                .setLabel("Assumir Ticket")
                                .setStyle(2)
                                .setCustomId("assumir_suport"),
                                new Discord.ButtonBuilder()
                                .setCustomId("painel_staff")
                                .setLabel("Painel Staff")
                                .setStyle(2),
                              ),
                        ]
                        
                      })
                      channel.send({embeds:[
                        new Discord.EmbedBuilder()
                        .addFields({
                            name: `motivo do Usuario`,
                            value: `\`\`\` ${motivo} \`\`\``
                        })
                    ]})
          }


          if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_ticket2"
          ) {
            const motivo = interaction.fields.getTextInputValue('report_ticket');
        
             const channel = await interaction.guild.channels.create({
                name: `🎫-${interaction.user.username}`,
                type: 0,
                parent: config.ticket.categoria,
                permissionOverwrites: [
                  {
                    id: interaction.guild.id,
                    deny: ["ViewChannel"],
                  },
                  {
                    id: interaction.user.id,
                    allow: [
                      "ViewChannel",
                      "SendMessages",
                      "AttachFiles",
                      "AddReactions",
                    ],
                  },
                  {
                    id: "1145203331518693437",
                    allow: [
                      "ViewChannel",
                      "SendMessages",
                      "AttachFiles",
                      "AddReactions",
                    ],},],});
                    interaction.reply({
                        embeds: [
                          new Discord.EmbedBuilder()
                            .setColor("Blurple")
                            .setDescription(
                              `Olá ${interaction.user}, Seu ticket criado com sucesso em ${channel}.`
                            ),
                        ],
                        ephemeral: true,
                        components: [
                            new Discord.ActionRowBuilder().addComponents(
                              new Discord.ButtonBuilder()
                                .setEmoji("🔗")
                                .setLabel("Acessar ticket")
                                .setStyle(5)
                                .setURL(`${channel.url}`)
                            ),
                          ],
                      });
                      channel.send({
                        content:"@everyone",
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle("White Hats | Ticket")
                            .setDescription(`Seja Bem Vindo(a) ao seu ticket \n \n Report  \n \n \`INFORMAÇÃO IMPORTANTE\` \n \n Os **TICKETS** São Totalmente privados, apenas Membros da **STAFF** Possuem acesso A Este Canal. \n \n Evite **MARCAÇÕES**, Aguarde até que um staff venha lhe atender \n \n Ticket assumido por:  \n \n  Este Canal é destinado para o seu **SUPORTE**, Seja Livre Para Dizer O que Precisa!`)
                            .setColor("Aqua"),
                        ],
                        components:[
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.ButtonBuilder()
                                  .setLabel("Fechar Ticket")
                                  .setStyle(Discord.ButtonStyle.Danger)
                                  .setCustomId("fechar_ticket"),
                                new Discord.ButtonBuilder()
                                .setLabel("Assumir Ticket")
                                .setStyle(2)
                                .setCustomId("assumir_report"),
                                new Discord.ButtonBuilder()
                                .setCustomId("painel_staff")
                                .setLabel("Painel Staff")
                                .setStyle(2),
                              ),
                        ]
                      })

                      channel.send({embeds:[
                        new Discord.EmbedBuilder()
                        .addFields({
                            name: `motivo do Usuario`,
                            value: `\`\`\` ${motivo} \`\`\``
                        })
                    ]})
          }

}


if (interaction.isButton() && interaction.customId === "assumir_report") {


    interaction.update({
        embeds:[
            new Discord.EmbedBuilder()
            .setTitle("White Hats | Ticket")
            .setDescription(`Seja Bem Vindo(a) ao seu ticket \n \n Report \n \n \`INFORMAÇÃO IMPORTANTE\` \n \n Os **TICKETS** São Totalmente privados, apenas Membros da **STAFF** Possuem acesso A Este Canal. \n \n Evite **MARCAÇÕES**, Aguarde até que um staff venha lhe atender \n \n Ticket assumido por: ${interaction.user}  \n \n  Este Canal é destinado para o seu **SUPORTE**, Seja Livre Para Dizer O que Precisa!`)
            .setColor("Default")
        ],
        components:[
            new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                  .setLabel("Fechar Ticket")
                  .setStyle(Discord.ButtonStyle.Danger)
                  .setCustomId("fechar_ticket"),
                new Discord.ButtonBuilder()
                .setLabel("Assumir Ticket")
                .setStyle(2)
                .setDisabled(true)
                .setCustomId("assumir_report"),
                new Discord.ButtonBuilder()
                .setCustomId("painel_staff")
                .setLabel("Painel Staff")
                .setStyle(2),
              ),
        ]
    })
            }
            if (interaction.isButton() && interaction.customId === "assumir_suport") {


                interaction.update({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle("White Hats | Ticket")
                        .setDescription(`Seja Bem Vindo(a) ao seu ticket \n \n support \n \n \`INFORMAÇÃO IMPORTANTE\` \n \nOs **TICKETS** São Totalmente privados, apenas Membros da **STAFF** Possuem acesso A Este Canal. \n \nEvite **MARCAÇÕES**, Aguarde até que um staff venha lhe atender \n \nTicket assumido por: ${interaction.user} \n \n Este Canal é destinado para o seu **SUPORTE**, Seja Livre Para Dizer O que Precisa!`)
                        .setColor("Default")
                    ],
                    components:[
                        new Discord.ActionRowBuilder().addComponents(
                            new Discord.ButtonBuilder()
                              .setLabel("Fechar Ticket")
                              .setStyle(Discord.ButtonStyle.Danger)
                              .setCustomId("fechar_ticket"),
                            new Discord.ButtonBuilder()
                            .setLabel("Assumir Ticket")
                            .setStyle(2)
                            .setDisabled(true)
                            .setCustomId("assumir_report"),
                            new Discord.ButtonBuilder()
                            .setCustomId("painel_staff")
                            .setLabel("Painel Staff")
                            .setStyle(2),
                          ),
                    ]
                })
                        }
    if (interaction.isButton() && interaction.customId === "assumir_duvida") {
                interaction.update({
                          embeds:[
                             new Discord.EmbedBuilder()
                               .setTitle("White Hats | Ticket")
                               .setDescription(`Seja Bem Vindo(a) ao seu ticket \n\n Duvida \n\n \`INFORMAÇÃO IMPORTANTE\` \n\nOs **TICKETS** São Totalmente privados, apenas Membros da **STAFF** Possuem acesso A Este Canal. \n\nEvite **MARCAÇÕES**, Aguarde até que um staff venha lhe atender \n\nTicket assumido por: ${interaction.user} \n\n Este Canal é destinado para o seu **SUPORTE**, Seja Livre Para Dizer O que Precisa!`)
                              .setColor("Default")
                            ],
                 components:[
                     new Discord.ActionRowBuilder().addComponents(
                             new Discord.ButtonBuilder()
                               .setLabel("Fechar Ticket")
                            .setStyle(Discord.ButtonStyle.Danger)
                                .setCustomId("fechar_ticket"),
                      new Discord.ButtonBuilder()
                            .setLabel("Assumir Ticket")
                            .setStyle(2)
                            .setDisabled(true)
                            .setCustomId("assumir_report"),
                            
                              new Discord.ButtonBuilder()
                                  .setCustomId("painel_staff")
                                 .setLabel("Painel Staff")
                                 .setStyle(2),
                                      ),
                                ]
                            })

                        }}}