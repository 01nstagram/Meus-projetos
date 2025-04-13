const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('chuta um membro pra fora do server')
    .addUserOption(opt => opt.setName('user').setDescription('usuario').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member.kickable) return interaction.reply('nao posso kikar esse desgraçado');
    await member.kick();
    await interaction.reply(`${user.tag} tomou bicuda da pakistan`);
  }
};