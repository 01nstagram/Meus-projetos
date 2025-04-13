const Discord = require("discord.js");
const transcript = require('discord-html-transcripts');
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
  name: 'transcript',
  description: 'Transcreva todas as mensagens deste canal para um arquivo HTML.',
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
      const config = await dbconfig.get(interaction.guild.id);

      if (!config) {
        return interaction.reply({ content: '**❌ | Você ainda não configurou seu servidor, utilize /painel.**', ephemeral: true });
      }

      const userRoles = interaction.member.roles.cache.map(role => role.id);
      const hasRole = config.roles.some(role => userRoles.includes(role));
      const hasUserPermission = config.usersperms.includes(interaction.user.id);

      if (!hasRole && !hasUserPermission) {
        return interaction.reply({ content: '**❌ | Você não tem permissão para utilizar este comando.**', ephemeral: true });
      }
    }

    const canalTranscript = interaction.channel;

    try {
      const attachment = await transcript.createTranscript(canalTranscript, {
        limit: -1,
        returnType: 'attachment',
        filename: `${canalTranscript.name}.html`,
        saveImages: true,
        footerText: 'Foram exportadas {number} mensagen{s}!',
        poweredBy: true
      });

      const config4 = await dbconfig.get(interaction.guild.id);
      const logChannelId24 = config4?.Logs;
      const logChannel2242 = client.channels.cache.get(logChannelId24);

      const embed = new Discord.EmbedBuilder()
        .setColor('Green')
        .setTitle('📝 Transcript Criado')
        .setDescription(`O transcript do canal \`${canalTranscript.name}\` foi criado com sucesso e enviado no canal: ${logChannel2242} !`)
        .setFooter({ text: 'Este transcript inclui todas as mensagens do canal.' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      const config = await dbconfig.get(interaction.guild.id);
      const logChannelId = config?.Logs;
      const logChannel = client.channels.cache.get(logChannelId);

      if (logChannel) {
        const logEmbed = new Discord.EmbedBuilder()
          .setAuthor({ name: 'Logs de Transcript', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
          .setTitle('**Novo Transcript Criado**')
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`🕒 | **Comando:** transcript\n👤 | **Executado por:** ${interaction.user}\n📋 | **Canal:** ${canalTranscript}\n📂 | **Arquivo:** [Clique para baixar](${attachment.url})\n🕒 | **Data e Hora da Criação:** ${new Date().toLocaleString()}`)
          .setColor('Random')
          .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed], files: [attachment] });
      }

    } catch (error) {
      console.error('Erro ao criar ou enviar o transcript:', error);
      return interaction.reply({ content: '**❌ | Ops, algo deu errado ao criar o transcript.**', ephemeral: true });
    }
  }
};
