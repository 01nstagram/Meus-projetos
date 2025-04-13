const { ApplicationCommandType, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
    name: "unban",
    description: "[ Unban ] Desbanir um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: 3,
            name: "usuario",
            description: "ID do usuário a ser desbanido",
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const config = await dbconfig.get(interaction.guild.id);

            if (!config) {
                return interaction.reply({ content: `**❌ | Você ainda não configurou seu servidor, utilize /painel.**`, ephemeral: true });
            }

            const cargosUsuario = interaction.member.roles.cache.map(role => role.id);
            const temCargo = config.roles.some(role => cargosUsuario.includes(role));
            const temPermissao = config.usersperms.includes(interaction.user.id);

            if (!temCargo && !temPermissao) {
                return interaction.reply({
                    content: `**❌ | Você não tem permissão para utilizar este comando.**`,
                    ephemeral: true
                });
            }
        }

        const usuarioId = interaction.options.getString("usuario");
        const usuarioAlvo = await client.users.fetch(usuarioId).catch(() => null);

        if (!usuarioAlvo) {
            return interaction.reply({ content: `**❌ | O usuário não pode ser encontrado.**`, ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(usuarioId, `Desbanido por ${interaction.user.tag}`);
        } catch (erro) {
            return interaction.reply({ content: `**❌ | Ocorreu um erro ao tentar desbanir o usuário.**`, ephemeral: true });
        }

        const embedSucesso = new EmbedBuilder()
            .setAuthor({ name: 'Comando Unban', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`✅ | O usuário ${usuarioAlvo.tag} foi desbanido com sucesso.`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor('Green')
            .setTimestamp();

        await interaction.reply({ embeds: [embedSucesso], ephemeral: true });

        const idCanalLogs = (await dbconfig.get(interaction.guild.id)).Logs;
        const canalLogs = client.channels.cache.get(idCanalLogs);

        if (canalLogs) {
            const embedLogs = new EmbedBuilder()
                .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
                .setTitle(`**Novo Unban Registrado**`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`👤 | **Usuário:** ${usuarioAlvo.tag}\n👮 | **Desbanido por:** ${interaction.user}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
                .setColor('Random')
                .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await canalLogs.send({ embeds: [embedLogs] });
        }
    }
};
