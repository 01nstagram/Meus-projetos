const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 Apaga mensagens do canal.')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Número de mensagens a apagar (1-100)')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Canal para limpar mensagens (opcional)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    // Verifica permissões
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Você não tem permissão para apagar mensagens.', ephemeral: true });
    }

    // Obtém o canal e a quantidade de mensagens
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const quantidade = interaction.options.getInteger('quantidade');

    // Valida a quantidade
    if (quantidade < 1 || quantidade > 100) {
      return interaction.reply({ content: '❌ Escolha um número entre **1 e 100**.', ephemeral: true });
    }

    try {
      // Tenta apagar as mensagens
      const mensagensApagadas = await channel.bulkDelete(quantidade, true);

      if (mensagensApagadas.size === 0) {
        return interaction.reply({ content: '⚠️ Não há mensagens recentes para apagar.', ephemeral: true });
      }

      await interaction.reply({ content: `✅ **${mensagensApagadas.size} mensagens foram apagadas** no canal ${channel}.`, ephemeral: true });

    } catch (error) {
      console.error('Erro ao apagar mensagens:', error);

      if (error.code === 50034) {
        return interaction.reply({ content: '⚠️ Não é possível apagar mensagens com mais de **14 dias**.', ephemeral: true });
      }

      await interaction.reply({ content: '❌ Ocorreu um erro ao tentar apagar as mensagens.', ephemeral: true });
    }
  }
};