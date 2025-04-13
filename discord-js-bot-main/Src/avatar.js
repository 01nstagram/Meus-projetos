const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Mostra o avatar de um usuário')
    .addUserOption(option => option.setName('target').setDescription('Usuário cujo avatar você quer ver')),
  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 1024, dynamic: true });

    return interaction.reply({ content: `${user.username}'s Avatar:`, embeds: [{ image: { url: avatarUrl } }] });
  },
};

