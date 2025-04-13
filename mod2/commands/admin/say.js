const Discord = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
  name: "say",
  description: "Faça eu falar",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "embed",
      description: "Falarei em embed.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "normal",
      description: "Falarei normal (sem embed).",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
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

    let embed_fala = interaction.options.getString("embed");
    let normal_fala = interaction.options.getString("normal");
    
    if (!embed_fala && !normal_fala) {
      return interaction.reply({ content: `**❌ | Escreva pelo menos em uma das opções.**`, ephemeral: true });
    } else {
      if (!embed_fala) embed_fala = "⠀";
      if (!normal_fala) normal_fala = "⠀";

      let embed = new Discord.EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(embed_fala);

      if (embed_fala === "⠀") {
        await interaction.reply({ content: `Sua mensagem foi enviada!`, ephemeral: true });
        await interaction.channel.send({ content: `${normal_fala}` });
      } else if (normal_fala === "⠀") {
        await interaction.reply({ content: `Sua mensagem foi enviada!`, ephemeral: true });
        await interaction.channel.send({ embeds: [embed] });
      } else {
        await interaction.reply({ content: `Sua mensagem foi enviada!`, ephemeral: true });
        await interaction.channel.send({ content: `${normal_fala}`, embeds: [embed] });
      }

      const config = await dbconfig.get(interaction.guild.id);
      const logChannelId = config?.Logs;
      const logChannel = client.channels.cache.get(logChannelId);

      if (logChannel) {
        const embedLogs = new Discord.EmbedBuilder()
          .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
          .setTitle(`**Novo Registro de Comando**`)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`🗣️ | **Comando:** say\n👤 | **Executado por:** ${interaction.user}\n📋 | **Mensagem em Embed:** ${embed_fala}\n💬 | **Mensagem Normal:** ${normal_fala}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
          .setColor("Random")
          .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        
        await logChannel.send({ embeds: [embedLogs] });
      }
    }
  }
};
