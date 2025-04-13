const { ApplicationCommandType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "nuke",
  description: "[ADM] Recrie um chat de texto",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "channel",
      description: "Canal",
      type: 7, // Channel type (7 corresponds to Channel)
      required: false,
    },
  ],

  run: async (client, interaction) => {
    // Verificar se o usuário tem permissão para gerenciar mensagens
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: ":x: Você não possui permissão para utilizar este comando.",
        ephemeral: true,
      });
    }

    // Obter o canal que será recriado (se não for fornecido, usa o canal atual)
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    try {
      // Clonar o canal
      const newChannel = await channel.clone();
      await channel.delete(); // Deletar o canal original

      // Enviar uma mensagem no novo canal
      await newChannel.send({
        content: "",
        embeds: [
          {
            title: "Sistema de Nuke",
            description: `:white_check_mark: Canal recriado com sucesso! Moderador: <@${interaction.user.id}>`,
            color: 0x2b2d31,
          },
        ],
      });

      // Responder ao comando de sucesso
      return interaction.reply({
        content: `:white_check_mark: O canal foi recriado com sucesso!`,
        ephemeral: false,
      });
    } catch (error) {
      // Caso haja algum erro, enviar uma mensagem de erro
      console.error("Erro ao executar o comando nuke:", error);
      return interaction.reply({
        content: ":x: Ocorreu um erro ao recriar o canal. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};