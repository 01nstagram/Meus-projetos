const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ddos')
    .setDescription('painel fake pra lançar ataque')
    .addStringOption(opt => opt.setName('ip').setDescription('ip alvo').setRequired(true))
    .addStringOption(opt => opt.setName('porta').setDescription('porta').setRequired(true))
    .addStringOption(opt => opt.setName('metodo').setDescription('udp/tcp/http').setRequired(true))
    .addIntegerOption(opt => opt.setName('tempo').setDescription('duraçao em segundos').setRequired(true)),
  async execute(interaction) {
    const ip = interaction.options.getString('ip');
    const porta = interaction.options.getString('porta');
    const metodo = interaction.options.getString('metodo');
    const tempo = interaction.options.getInteger('tempo');
    await interaction.reply(`ATAQUE INICIADO EM ${ip}:${porta} usando ${metodo.toUpperCase()} por ${tempo}s kkkkkkk`);
  }
};