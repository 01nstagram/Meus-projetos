const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('limpa mensagens do chat')
    .addIntegerOption(opt => opt.setName('quantidade').setDescription('qtd de msgs').setRequired(true)),
  async execute(interaction) {
    const qtd = interaction.options.getInteger('quantidade');
    const channel = interaction.channel;
    await channel.bulkDelete(qtd, true);
    await interaction.reply({ content: `limpei ${qtd} msg kkkkk`, ephemeral: true });
  }
};