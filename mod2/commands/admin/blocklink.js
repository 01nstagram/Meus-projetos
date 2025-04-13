const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
  name: "antilink",
  description: "[ Anti Link ] Ative ou desative o sistema de antilink no servidor.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      const config = await dbconfig.get(interaction.guild.id);

      if (!config) {
        return interaction.reply({ content: `**❌ | Você ainda não configurou seu servidor, utilize /painel.**`, ephemeral: true });
      }

      const cargosUsuario = interaction.member.roles.cache.map(role => role.id);
      const temCargo = config.roles.some(role => cargosUsuario.includes(role));
      const temPermissao = config.usersperms.includes(interaction.user.id);

      if (!temCargo && !temPermissao) {
        return interaction.reply({ content: `**❌ | Você não tem permissão para utilizar este comando.**`, ephemeral: true });
      }
    }

    let embed_g = new Discord.EmbedBuilder()
      .setColor("Green")
      .setDescription(`Olá ${interaction.user}, o sistema de antilink foi \`ativado\`.`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    let embed_r = new Discord.EmbedBuilder()
      .setColor("Red")
      .setDescription(`Olá ${interaction.user}, o sistema de antilink foi \`desativado\`.`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    let confirm = await db.get(`antilink_${interaction.guild.id}`);

    if (confirm === null || confirm === false) {
      interaction.reply({ embeds: [embed_g] });
      await db.set(`antilink_${interaction.guild.id}`, true);
    } else if (confirm === true) {
      interaction.reply({ embeds: [embed_r] });
      await db.set(`antilink_${interaction.guild.id}`, false);
    }

    const config = await dbconfig.get(interaction.guild.id);
    const idCanalLogs = config?.Logs;
    const canalLogs = client.channels.cache.get(idCanalLogs);

    if (canalLogs) {
      const embedLogs = new Discord.EmbedBuilder()
        .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
        .setTitle(`**Novo Registro de Comando**`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`🔧 | **Comando:** antilink\n👮 | **Executado por:** ${interaction.user}\n📋 | **Status:** ${confirm ? 'Desativado' : 'Ativado'}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
        .setColor('Random')
        .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await canalLogs.send({ embeds: [embedLogs] });
    }
  }
};
