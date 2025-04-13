const { ApplicationCommandType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "unlock",
  description: "[🔧 Moderação] Desbloqueie o Canal.",
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    // Verifica se o usuário tem permissão de Gerenciar Canais
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "Você não tem permissão de `Gerenciar Canais`.",
        ephemeral: true,
      });
    }

    // Responde ao usuário indicando que o processo de desbloqueio foi iniciado
    await interaction.reply({
      content: "Aguarde um momento... Estamos desbloqueando o canal.",
    });

    // Altera as permissões para desbloquear o canal
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      SendMessages: true, // Permite que todos enviem mensagens
    });

    // Altera as permissões do usuário que usou o comando (para garantir que ele possa enviar mensagens)
    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      SendMessages: true,
    });

    // Atualiza a resposta com sucesso
    interaction.editReply({
      content: "Canal desbloqueado com sucesso!",
    });
  },
};
