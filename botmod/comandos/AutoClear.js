const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoclear')
    .setDescription('Limpa o canal automaticamente em um intervalo de tempo.')
    .addIntegerOption(option => 
      option.setName('timeout')
        .setDescription('Tempo em segundos entre cada limpeza (mínimo 10s).')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Verifica permissão de administrador
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const channel = interaction.channel;
    const timeout = interaction.options.getInteger('timeout') * 1000; 

    if (timeout < 10000) {
      return interaction.reply({ content: '⏳ O tempo mínimo é de 10 segundos.', ephemeral: true });
    }

    const embed = {
      color: 0xff0000,
      title: '🧹 Auto Clear Ativado!',
      description: `O canal será limpo a cada **${timeout / 1000} segundos**.`,
      footer: { text: 'Clique no botão abaixo para parar o auto clear.' }
    };

    let intervalId;
    const stopButton = {
      type: 2, // Botão interativo
      customId: 'stop-clear',
      label: 'Parar Auto Clear',
      style: ButtonStyle.Danger
    };

    const row = { type: 1, components: [stopButton] };

    await interaction.reply({ embeds: [embed], components: [row] });

    // Inicia a limpeza automática
    intervalId = setInterval(async () => {
      try {
        const messages = await channel.messages.fetch({ limit: 100 });
        if (messages.size > 0) {
          await channel.bulkDelete(messages, true);
        }
      } catch (error) {
        console.error('❌ Erro ao limpar mensagens:', error);
      }
    }, timeout);

    // Coletor para parar a limpeza
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: timeout * 10
    });

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.customId === 'stop-clear') {
        clearInterval(intervalId);
        collector.stop();
        await btnInteraction.update({ content: '🛑 Auto Clear Cancelado.', components: [] });
      }
    });

    collector.on('end', () => {
      clearInterval(intervalId);
    });
  },
};