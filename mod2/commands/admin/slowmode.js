const Discord = require("discord.js");
const ms = require("ms");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
  name: "slowmode",
  description: "Configure o modo lento em um canal de texto.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "tempo",
      description: "Coloque o tempo do modo lento [s|m|h].",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "canal",
      description: "Mencione um canal de texto.",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: false,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) {
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

    let t = interaction.options.getString("tempo");
    let tempo = ms(t);
    let channel = interaction.options.getChannel("canal");
    if (!channel || channel === null) channel = interaction.channel;

    if (!tempo || tempo === false || tempo === null || !/^([0-9]+[smh])$/.test(t)) {
      return interaction.reply({ content: `**❌ | Forneça um tempo válido no formato correto [s|m|h].**`, ephemeral: true });
    }

    try {
      await channel.setRateLimitPerUser(tempo / 1000);

      await interaction.reply({ content: `✅ | O canal de texto ${channel} teve seu modo lento definido para \`${t}\`.` });

      const config = await dbconfig.get(interaction.guild.id);
      const logChannelId = config?.Logs;
      const logChannel = client.channels.cache.get(logChannelId);

      if (logChannel) {
        const embedLogs = new Discord.EmbedBuilder()
          .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
          .setTitle(`**Novo Registro de Comando**`)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`🕒 | **Comando:** slowmode\n👤 | **Executado por:** ${interaction.user}\n📋 | **Canal:** ${channel}\n⏱️ | **Tempo Definido:** ${t}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
          .setColor("Random")
          .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        
        await logChannel.send({ embeds: [embedLogs] });
      }
    } catch (error) {
      await interaction.reply({ content: `**❌ | Ops, algo deu errado ao executar este comando, verifique minhas permissões.**`, ephemeral: true });
    }
  }
};
