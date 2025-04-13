const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alerta')
    .setDescription('manda um alerta psicológico')
    .addStringOption(opt => opt.setName('msg').setDescription('mensagem de alerta').setRequired(true)),
  async execute(interaction) {
    const msg = interaction.options.getString('msg');
    await interaction.reply(`⚠️ ALERTA DA PAKISTAN: ${msg}`);
  }
};