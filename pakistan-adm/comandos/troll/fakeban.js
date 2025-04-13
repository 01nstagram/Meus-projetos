const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fakeban')
    .setDescription('manda embed fake de banimento')
    .addUserOption(opt => opt.setName('user').setDescription('alvo').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const embed = new EmbedBuilder()
      .setTitle('BANIMENTO PERMANENTE')
      .setDescription(`${user.tag} foi banido por comportamento suspeito.`)
      .setFooter({ text: 'motivo: uso de hackzin kkkkk' })
      .setColor(0x000000);
    await interaction.reply({ embeds: [embed] });
  }
};