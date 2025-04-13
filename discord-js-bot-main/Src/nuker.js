const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Apaga e recria o canal em sua posição original.')
    .setDefaultMemberPermissions(8),
  async execute(interaction) {
    const channel = interaction.channel;

    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    }

    try {
      const position = channel.position;
      const parent = channel.parent;
      const permissions = channel.permissionOverwrites.cache;

      await channel.delete();

      const newChannel = await parent.createChannel(channel.name, {
        type: channel.type,
        position: position,
        permissionOverwrites: permissions,
        topic: channel.topic,
        nsfw: channel.nsfw,
      });

      return interaction.reply({ content: `Canal ${channel.name} apagado e recriado com sucesso!`, ephemeral: true });
    } catch (error) {
      console.error('Erro ao recriar o canal:', error);
      return interaction.reply({ content: 'Houve um erro ao tentar apagar e recriar o canal. Tente novamente mais tarde.', ephemeral: true });
    }
  },
};

