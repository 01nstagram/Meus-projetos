const Discord = require("discord.js");
const config = require("../config.json");
const fs = require("fs");
const moment = require("moment-timezone");
const sourcebin = require("sourcebin");

module.exports = {
  name: "buttonsticket",
  async execute(interaction) {
    if (interaction.isButton() && interaction.customId === "delete_agora") {
        interaction.channel.delete();
        }
        if (interaction.isButton() && interaction.customId === "fechar_ticket") {
            interaction.channel.delete();
            }

        
    if (interaction.isButton() && interaction.customId === "painel_staff") {
      if (
        !interaction.member.permissions.has(
          Discord.PermissionFlagsBits.ManageChannels
        )
      )
        return interaction.reply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `<a:errado1:1124475561545318462> | Você não tem permissão para abrir está função, somente o dono do ticket.`
              ),
          ],
          ephemeral: true,
        });

      interaction.reply({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor("Default")
            .setDescription(
              `Painel Staff aberto com sucesso, escolha uma das opções abaixo:`
            ),
        ],
        components: [
          new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
              .setCustomId("options_member")
              .setPlaceholder("Escolha uma opção!")
              .addOptions(
                {
                  label: "Criar call",
                  value: `create_call`,
                },
                {
                    label: "Deletar Ticket",
                    value: `delete_ticket`,
                },
                {
                  label: "Deletar call",
                  value: `delete_call`,
                },
                {
                  label: "Adicionar usuário",
                  value: `add_user`,
                },
                {
                  label: "Remover usuário",
                  value: `remove_user`,
                },
                {
                  label: "Salvar logs",
                  value: `transcript`,
                },
                {
                  label: "Notificar Staff",
                  value: `notify_staff`,
                }
              )
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "options_member"
    ) {
      const option = interaction.values[0];

      if (option === "create_call") {
        const channel_find = await interaction.guild.channels.cache.find(
          (c) =>
            c.name ===
            `📞-${interaction.user.username.toLowerCase().replace(/ /g, "-")}`
        );

        if (channel_find)
          return interaction.update({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor("Default")
                .setDescription(
                  `<a:errado1:1124475561545318462> | Você já possui uma call aberta em ${channel_find}`
                ),
            ],
            components: [
              new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                  .setStyle(5)
                  .setLabel("Entrar na call")
                  .setURL(channel_find.url)
              ),
            ],
            ephemeral: true,
          });

        const channel = await interaction.guild.channels.create({
          name: `📞-${interaction.user.username
            .toLowerCase()
            .replace(/ /g, "-")}`,
          type: 2,
          parent: config.ticket.categoria,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["ViewChannel"],
            },
            {
              id: interaction.user.id,
              allow: ["Connect", "ViewChannel"],
            },
            {
              id: config.ticket.support_role,
              allow: ["Connect", "ViewChannel"],
            },
          ],
        });

        interaction.update({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `<a:1111104374039662704:1124475416707616828> | Call criada com sucesso em ${channel}`
              ),
          ],
          components: [
            new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
                .setStyle(5)
                .setLabel("Entrar na call")
                .setURL(channel.url)
            ),
          ],
          ephemeral: true,
        });
      } else if (option === "delete_call") {
        const channel_find = await interaction.guild.channels.cache.find(
          (c) =>
            c.name ===
            `📞-${interaction.user.username.toLowerCase().replace(/ /g, "-")}`
        );

        if (!channel_find)
          return interaction.update({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor("Default")
                .setDescription(
                  `<a:err24475561545318462> | Você não nenhuma possui uma call aberta!`
                ),
            ],
            components: [],
            ephemeral: true,
          });

        await channel_find.delete();

        interaction.update({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `<a:1111104374039662704:1124475416707616828> | Call deletada com sucesso!`
              ),
          ],
          components: [],
          ephemeral: true,
        });
      } else if (option === "add_user") {
        interaction.update({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `👤 | Marce ou envie o ID do usuário que você deseja adicionar!`
              ),
          ],
          components: [],
          ephemeral: true,
        });

        const filter = (i) => i.member.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
        });

        collector.on("collect", async (collect) => {
          const user_content = await collect.content;
          collect.delete();

          const user_collected =
            interaction.guild.members.cache.get(user_content);

          if (!user_collected)
            return interaction.editReply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor("Default")
                  .setDescription(
                    `<a:errado1:1124475561545318462> | Não foi possível encontrar o usuário \`${user_content}\`, tente novamente!`
                  ),
              ],
              components: [],
              ephemeral: true,
            });

          if (
            interaction.channel
              .permissionsFor(user_collected.id)
              .has("ViewChannel")
          )
            return interaction.editReply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor("Default")
                  .setDescription(
                    `<a:errado1:1124475561545318462> | O usuário ${user_collected}(\`${user_collected.id}\`) já possui acesso ao ticket!`
                  ),
              ],
              components: [],
              ephemeral: true,
            });

          await interaction.channel.edit({
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["ViewChannel"],
              },
              {
                id: user.id,
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AttachFiles",
                  "AddReactions",
                  "ReadMessageHistory",
                ],
              },
              {
                id: user_collected.id,
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AttachFiles",
                  "AddReactions",
                  "ReadMessageHistory",
                ],
              },
              {
                id: config.ticket.support_role,
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AttachFiles",
                  "AddReactions",
                  "ReadMessageHistory",
                ],
              },
            ],
          });

          interaction.editReply({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor("Default")
                .setDescription(
                  `<a:1111104374039662704:1124475416707616828> | O usuário ${user_collected}(\`${user_collected.id}\`) foi adicionado com sucesso!`
                ),
            ],
            components: [],
            ephemeral: true,
          });

          collector.stop();
        });
      } else if (option === "notify_staff") {
        const supportRoleId = config.ticket.support_role; // Substitua pelo ID do cargo de suporte
        const supportRole = interaction.guild.roles.cache.get(supportRoleId);
        const embed1 = new Discord.EmbedBuilder()
          .setDescription(
            `O Usuario <@${interaction.user.id}> está esperando no ticket: ${interaction.channel}`
          ) // Adicione a descrição aqui
          .setColor("Default");
        const components = new Discord.ActionRowBuilder().addComponents(
          new Discord.ButtonBuilder()
            .setStyle(5)
            .setLabel("Ticket")
            .setURL(interaction.channel.url)
        );

        if (!supportRole) {
          return interaction.reply(
            "Função de suporte não encontrada. Verifique a configuração."
          );
        }

        // Envia a mensagem para cada usuário com o cargo de suporte
        interaction.guild.members.cache
          .filter((member) => member.roles.cache.has(supportRoleId))
          .each(async (member) => {
            try {
              const user = await member.user.createDM();
              await user.send({ embeds: [embed1], components: [components] });
            } catch (error) {
              console.error(
                `Erro ao enviar a mensagem privada para ${member.user.tag}: ${error}`
              );
            }
          });

        await interaction.reply({
          content: ` <a:1111104374039662704:1124475416707616828>|** <@${interaction.user.id}> Os Staffs foram notificado com sucesso**`,
          ephemeral: true, // A resposta será visível somente para o usuário que executou o comando
        });
      } else if (option === "remove_user") {
        interaction.update({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `👤 | Marce ou envie o ID do usuário que você deseja remover!`
              ),
          ],
          components: [],
          ephemeral: true,
        });

        const filter = (i) => i.member.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
        });

        collector.on("collect", async (collect) => {
          const user_content = await collect.content;
          collect.delete();

          const user_collected =
            interaction.guild.members.cache.get(user_content);

          if (!user_collected)
            return interaction.editReply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor("Default")
                  .setDescription(
                    `<a:errado1:1124475561545318462> | Não foi possível encontrar o usuário \`${user_content}\`, tente novamente!`
                  ),
              ],
              components: [],
              ephemeral: true,
            });

          if (
            !interaction.channel
              .permissionsFor(user_collected.id)
              .has("ViewChannel")
          )
            return interaction.editReply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor("Default")
                  .setDescription(
                    `<a:errado1:1124475561545318462> | O usuário ${user_collected}(\`${user_collected.id}\`) não possui acesso ao ticket!`
                  ),
              ],
              components: [],
              ephemeral: true,
            });

          await interaction.channel.edit({
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["ViewChannel"],
              },
              {
                id: user_collected.id,
                denny: ["ViewChannel"],
              },
              {
                id: user.id,
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AttachFiles",
                  "AddReactions",
                  "ReadMessageHistory",
                ],
              },
              {
                id: config.ticket.support_role,
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AttachFiles",
                  "AddReactions",
                  "ReadMessageHistory",
                ],
              },
            ],
          });

          interaction.editReply({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor("Default")
                .setDescription(
                  `<a:1111104374039662704:1124475416707616828> | O usuário ${user_collected}(\`${user_collected.id}\`) foi removido com sucesso!`
                ),
            ],
            components: [],
            ephemeral: true,
          });

          collector.stop();
        });
      } else if (option === "delete_ticket") {

        interaction.reply({
            embeds:[
                new Discord.EmbedBuilder()
                .setDescription(`${interaction.user} você tem certeza que deseja excluir esse ticket?`)
            ],
            components:[
                new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId(`delete_agora`)
                    .setLabel("SIM")
                    .setStyle(Discord.ButtonStyle.Danger))
            ],


        })
        } else if (option === "transcript") {
        await interaction.update({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `<a:carregando_2:1124475451973316798> Salvando logs do ticket ${interaction.channel}, aguarde um pouco...`
              ),
          ],
          components: [],
          ephemeral: true,
        });

        let output = interaction.channel.messages.cache
          .filter((m) => m.author.bot !== true)
          .map(
            (m) =>
              `${new Date(m.createdTimestamp).toLocaleString("pt-BR")}-${
                m.author.username
              }#${m.author.discriminator}: ${
                m.attachments.size > 0
                  ? m.attachments.first().proxyURL
                  : m.content
              }`
          )
          .reverse()
          .join("\n");

        if (output.length < 1) output = "Nenhuma conversa aqui :)";

        try {
          response = await sourcebin.create({
            title: `Histórico do ticket: ${interaction.channel.name}`,
            description: `Copyright © ${config.ticket.credits}`,
            files: [
              {
                content: output,
                language: "text",
              },
            ],
          });
        } catch (e) {
          return interaction.editReply({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor("Default")
                .setDescription(
                  `<a:errado1:1124475561545318462> | Ocorreu um erro ao salvar as logs do ticket ${interaction.channel}, tente novamente!`
                ),
            ],
            components: [],
            ephemeral: true,
          });
        }

        await interaction.user.send({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setTitle(
                `<:prancheta2:1130047888458797146> Historico de mensagens do ticket`
              )
              .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
              .addFields(
                {
                  name: "<:F_Canal:1130049735911280640> Canal:",
                  value: `\`\`\`${interaction.channel.name}\`\`\``,
                  inline: false,
                },
                {
                  name: "<:tempoJEFF:1130049930526986301> Protocolo:",
                  value: `\`\`\`${interaction.channel.id}\`\`\``,
                  inline: true,
                },
                {
                  name: "<:verde_data:1130048234270769282> Data de emissão",
                  value: `\`\`\`${moment()
                    .utc()
                    .tz("America/Sao_Paulo")
                    .format("DD/MM/Y - HH:mm:ss")}\`\`\``,
                }
              ),
          ],
          components: [
            new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
                .setStyle(5)
                .setEmoji("<:prancheta2:1130047888458797146>")
                .setLabel("Ir para logs")
                .setURL(response.url)
            ),
          ],
        });

        interaction.editReply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Default")
              .setDescription(
                `<a:1111104374039662704:1124475416707616828> | As logs do ticket ${interaction.channel} foram enviadas em seu privado!`
              ),
          ],
          components: [],
          ephemeral: true,
        });
      }
    }

  },
};
