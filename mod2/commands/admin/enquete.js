const Discord = require("discord.js");
const ms = require('ms');
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
  name: 'enquete',
  description: 'Crie uma enquete no servidor.',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'tempo',
      description: 'Coloque um tempo em s/m/h/d.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'título',
      description: 'Qual será o título da enquete.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'opção1',
      description: 'Adicione a opção 1 de votação.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'opção2',
      description: 'Adicione a opção 2 de votação.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      const config = await dbconfig.get(interaction.guild.id);

      if (!config) {
        return interaction.reply({ content: `**❌ | Você ainda não configurou seu servidor, utilize /painel.**`, ephemeral: true });
      }

      const userRoles = interaction.member.roles.cache.map(role => role.id);
      const hasRole = config.roles.some(role => userRoles.includes(role));
      const hasUserPermission = config.usersperms.includes(interaction.user.id);

      if (!hasRole && !hasUserPermission) {
        return interaction.reply({ content: `**❌ | Você não tem permissão para utilizar este comando.**`, ephemeral: true });
      }
    }

    const tempo = interaction.options.getString('tempo');
    const titulo = interaction.options.getString('título');
    const op1 = interaction.options.getString('opção1');
    const op2 = interaction.options.getString('opção2');

    let tempoms = ms(tempo);
    if (isNaN(tempoms) || !/^([0-9]+[smhd])$/.test(tempo)) {
      return interaction.reply({ content: `**❌ | O tempo fornecido é inválido. Use s, m, h ou d. Exemplo: \`10m\` ou \`1h\`.**`, ephemeral: true });
    }

    const emojis = ['1️⃣', '2️⃣'];

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setColor('Yellow')
      .setTitle(`📊 Enquete: ${titulo}`)
      .setDescription(`**Criada por:** ${interaction.user} (${interaction.user.id})\n\n> ${emojis[0]} ${op1}\n> ${emojis[1]} ${op2}`)
      .setTimestamp(new Date(new Date().getTime() + tempoms))
      .setFooter({ text: `Final da enquete:`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

    interaction.reply({ content: '✅ Enquete criada com sucesso!', ephemeral: true }).then(() => {
      interaction.channel.send({ embeds: [embed] }).then((msgg) => {
        emojis.forEach(emoji => {
          msgg.react(emoji);
        });

        setTimeout(async () => {
          const msg = await interaction.channel.messages.fetch(msgg.id);

          let emojiOpc1 = msg.reactions.cache.get(emojis[0])?.count || 0;
          let emojiOpc2 = msg.reactions.cache.get(emojis[1])?.count || 0;

          let win;
          if (emojiOpc1 > emojiOpc2) win = `${op1} (Total de reações: \`${emojiOpc1}\`)`;
          else if (emojiOpc2 > emojiOpc1) win = `${op2} (Total de reações: \`${emojiOpc2}\`)`;
          else win = `As duas opções foram votadas igualmente (Total de reações: \`${emojiOpc1}\`).`;

          const embedOff = new Discord.EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setColor('Red')
            .setTitle(`❌ Enquete Encerrada: ${titulo}`)
            .setDescription(`**Criada por:** ${interaction.user} (${interaction.user.id})\n\n> ${emojis[0]} ${op1}\n> ${emojis[1]} ${op2}\n\n**Opção mais votada:** ${win}`)
            .setTimestamp()
            .setFooter({ text: `Enquete encerrada às:`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

          msg.reply({ content: `**📝 Enquete Encerrada**\n\n> **Opção mais votada:** ${win}` });
          msg.edit({ embeds: [embedOff] });

          const config = await dbconfig.get(interaction.guild.id);
          const logChannelId = config?.Logs;
          const logChannel = client.channels.cache.get(logChannelId);

          if (logChannel) {
            const logEmbed = new Discord.EmbedBuilder()
              .setAuthor({ name: 'Logs de Enquete', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
              .setTitle(`**Novo Registro de Enquete**`)
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
              .setDescription(`🕒 | **Comando:** enquete\n👤 | **Executado por:** ${interaction.user}\n📋 | **Título:** ${titulo}\n🗳️ | **Opções:**\n> ${emojis[0]} ${op1}\n> ${emojis[1]} ${op2}\n⏱️ | **Tempo Definido:** ${tempo}\n🕒 | **Data e Hora da Criação:** ${new Date().toLocaleString()}`)
              .setColor("Random")
              .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
              .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
          }
        }, tempoms);
      });
    });
  }
};
