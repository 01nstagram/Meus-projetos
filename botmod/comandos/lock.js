const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "lock",
    description: "[🔧 Moderação] Tranque o Canal.",
    type: 1, // Comando de chat
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: "Você não tem permissão de `Gerenciar Canais`.",
                ephemeral: true,
            });
        }

        await interaction.reply({
            content: "Aguarde um momento... Estamos trancando o canal.",
        });

        // Alterando as permissões para impedir o envio de mensagens
        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: false, // Impede o envio de mensagens para todos
        });

        // Altera as permissões do usuário que executou o comando para garantir que ele possa enviar mensagens
        await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
            SendMessages: true,
        });

        interaction.editReply({
            content: "Canal trancado com sucesso!",
        });
    },
};
