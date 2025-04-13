const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exposed')
    .setDescription('expondo o usuario com dados fake kkk')
    .addUserOption(opt => opt.setName('user').setDescription('usuario alvo').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const embed = new EmbedBuilder()
      .setTitle('EXPOSED DETECTADO')
      .setDescription(`usuario: ${user.tag}\nemail: ${user.username}@gmail.com\nip: 69.69.69.69\ntoken: mfa.abc123faKEt0kenXD`)
      .setColor(0xff0000);
    await interaction.reply({ embeds: [embed] });
  }
};