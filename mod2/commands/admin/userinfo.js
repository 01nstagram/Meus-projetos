const Discord = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
  name: "userinfo",
  description: "Veja informações detalhadas de um usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Mencione um usuário.",
      type: Discord.ApplicationCommandOptionType.User,
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

    const user = interaction.options.getUser("usuário");
    const member = await interaction.guild.members.fetch(user.id);
    const dataConta = user.createdAt.toLocaleString();
    const id = user.id;
    const tag = user.tag;
    const isBot = user.bot ? "Sim" : "Não";

    const userFlags = await user.fetchFlags();
    const badges = userFlags.toArray();
    
    const badgeMap = {
      "Staff": "⭐ Discord Staff",
      "Partner": "💼 Partner",
      "CertifiedModerator": "🛡️ Certified Moderator",
      "Hypesquad": "🎉 HypeSquad Events",
      "HypeSquadOnlineHouse1": "⚔️ HypeSquad Bravery",
      "HypeSquadOnlineHouse2": "💡 HypeSquad Brilliance",
      "HypeSquadOnlineHouse3": "⚖️ HypeSquad Balance",
      "BugHunterLevel1": "🐛 Bug Hunter",
      "BugHunterLevel2": "🏆 Bug Hunter Gold",
      "ActiveDeveloper": "👨‍💻 Active Developer",
      "VerifiedDeveloper": "🛠️ Early Verified Bot Developer",
      "PremiumEarlySupporter": "💎 Early Supporter"
    };

    const badgeList = badges.map(badge => badgeMap[badge] || badge).join(", ") || "Nenhuma badge";
    const roles = member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role.toString()).join(', ') || "Nenhum";

    const embed = new Discord.EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTitle("Informações do Usuário:")
      .addFields(
        { name: `🎇 Tag:`, value: `\`${tag}\`.`, inline: false },
        { name: `🆔 Id:`, value: `\`${id}\`.`, inline: false },
        { name: `📅 Criação da conta:`, value: `\`${dataConta}\`.`, inline: false },
        { name: `🤖 É um bot?`, value: `\`${isBot}\`.`, inline: false },
        { name: `🎫 Distinções:`, value: badgeList, inline: false },
        { name: `🔖 Cargos:`, value: `\`${roles}\`.`, inline: false }
      );

    const botao = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setURL(user.displayAvatarURL({ dynamic: true }))
        .setEmoji("📎")
        .setStyle(Discord.ButtonStyle.Link)
        .setLabel(`Avatar de ${user.username}.`)
    );

    await interaction.reply({ embeds: [embed], components: [botao], ephemeral: true });

    const config = await dbconfig.get(interaction.guild.id);
    const logChannelId = config?.Logs;
    const logChannel = client.channels.cache.get(logChannelId);

    if (logChannel) {
      const embedLogs = new Discord.EmbedBuilder()
        .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
        .setTitle(`**Novo Registro de Comando**`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`🕒 | **Comando:** userinfo\n👤 | **Executado por:** ${interaction.user}\n🧑 | **Usuário:** ${user}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
        .setColor("Random")
        .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await logChannel.send({ embeds: [embedLogs] });
    }
  }
};
