const { ApplicationCommandType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "serverinfo",
  description: "👀 Geral┃Veja as informações do servidor",
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const { guild } = interaction;
    
    // Obtenção das informações do servidor
    const membros = guild.memberCount;
    const bots = guild.members.cache.filter(member => member.user.bot).size; // Contagem de bots
    const cargos = guild.roles.cache.sort((a, b) => b.position - a.position).first(3).map(role => role.name); // Pega os 3 cargos mais altos
    const emojis = guild.emojis.cache.size;
    const impulsos = guild.premiumSubscriptionCount;
    const dono = await guild.fetchOwner();
    const botEntrada = guild.members.cache.get(client.user.id).joinedAt; // Data de entrada do bot
    const dataCriacao = moment(guild.createdAt).locale('pt-br').format('LLLL'); // Data de criação do servidor em PT-BR

    // Construção da mensagem embed
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setDescription(`**Informações do(a) > ${guild.name}**`)
      .setThumbnail(guild.iconURL({ dynamic: true, format: "png", size: 4096 })) // Adiciona a logo do servidor
      .addFields(
        { name: "ID do Servidor", value: `\`${guild.id}\`` },
        { name: "Criado em", value: `\`${dataCriacao}\``, inline: true },
        { name: "Bot Entrou em", value: `<t:${Math.floor(botEntrada / 1000)}:D>`, inline: true },
        { name: "Dono do Servidor", value: `\`${dono.user.tag}\n(<@${dono.id}>)\``, inline: true },
        { name: "ID do Dono", value: `${dono.id}`, inline: true },
        { name: "Membros", value: `Total: \`${membros}\`\nBots: \`${bots}\``, inline: true },
        { name: "Canais", value: `Total: \`${guild.channels.cache.size}\``, inline: true },
        { name: "Boosts", value: `Nível: \`${guild.premiumTier}\`\nQuantidade: \`${impulsos}\``, inline: true },
        { name: "Emojis", value: `Total: \`${emojis}\``, inline: true },
        { name: "Cargos Mais Altos", value: `\`${cargos.join(', ')}\``, inline: true }
      );

    // Enviar a embed com as informações do servidor
    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
