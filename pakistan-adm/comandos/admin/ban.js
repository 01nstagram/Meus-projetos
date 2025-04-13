const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('BAN direto no c*')
    .addUserOption(opt => opt.setName('user').setDescription('usuario').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member.bannable) return interaction.reply('nao da pra banir o corno');
    await member.ban({ reason: 'mandado pela pakistan' });
    await interaction.reply(`${user.tag} foi banido, missão dada missão cumprida`);
  }
};