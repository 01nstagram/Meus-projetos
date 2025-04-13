const Discord = require("discord.js");
const ms = require("ms"); // Antes de executar o comando use "npm i pretty-ms ms"

module.exports = {
    name: "unmute",
    description: "🛠️ Remova o castigo de um membro!",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuario",
            description: "O usuário para remover o timeout.",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        },
    ],

    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ModerateMembers)) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando. Você precisa ter a permissão de Moderar Membros!`, ephemeral: true });
        } else {
            const mentionable = interaction.options.get("usuario").value;
            const duration = "1s";
            const msDuration = ms(duration);

            const targetUser = await interaction.guild.members.fetch(mentionable);
            if (!targetUser) {
                await interaction.reply({
                    content: "Esse usuário não existe neste servidor.",
                    ephemeral: true,
                });
                return;
            }

            if (targetUser.user.bot) {
                await interaction.reply({
                    content: "Não posso dar mute para um bot.",
                    ephemeral: true,
            });
                return;
            }

            const targetUserRolePosition = targetUser.roles.highest.position;
            const requestUserRolePosition = interaction.member.roles.highest.position;
            const botRolePosition = interaction.guild.members.me.roles.highest.position;

            if (targetUserRolePosition >= requestUserRolePosition) {
                await interaction.reply({
                    content: "Você não pode dar timeout para esse usuário porque eles têm o mesmo cargo ou um cargo maior que o seu.",
                    ephemeral: true,
            });
                return;
            }

            if (targetUserRolePosition >= botRolePosition) {
                await interaction.reply({
                    content: "Não posso dar mute para esse usuário porque eles têm o mesmo cargo ou um cargo maior que o meu.",
                ephemeral: true,
            });
                return;
            }

            await interaction.deferReply();

            try {
                const { default: prettyMs } = await import("pretty-ms");

                if (targetUser.isCommunicationDisabled()) {
                    await targetUser.timeout(msDuration);
                    let embed = new Discord.EmbedBuilder()
                        .setColor("Random")
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setTitle(`mute removido com sucesso!`)
                        .setDescription(`
                    > Usuário: ${targetUser}
                    > Moderador: ${interaction.user}`)
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
            } catch (error) {
                console.log(`Houve um erro ao tentar remover o mute: ${error}`);
            }
        }
    }
}