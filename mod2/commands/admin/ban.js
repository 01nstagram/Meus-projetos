const { ApplicationCommandType, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
    name: "ban",
    description: "[ Ban ] Banir um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: 6,
            name: "usuario",
            description: "Usuário que será banido",
            required: true
        },
        {
            type: 3,
            name: "motivo",
            description: "Motivo para banir o usuário",
            required: false
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

        const usuarioAlvo = interaction.options.getUser("usuario");
        const motivo = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
        const membro = interaction.guild.members.cache.get(usuarioAlvo.id);

        if (!membro) {
            return interaction.reply({ content: `**❌ | O usuário não está no servidor.**`, ephemeral: true });
        }

        if (membro.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: `**❌ | Não posso banir usuários com cargos mais altos ou iguais ao meu.**`, ephemeral: true });
        }

        const config = await dbconfig.get(interaction.guild.id);
        const usuariosProtegidos = config.protegidos || [];

        if (usuariosProtegidos.includes(usuarioAlvo.id)) {
            return interaction.reply({ content: `**❌ | Não é possível banir usuários que estão na lista de protegidos.**`, ephemeral: true });
        }

        try {
            await membro.ban({ reason: `Banido por ${interaction.user.tag} | Motivo: ${motivo}` });
        } catch (erro) {
            return interaction.reply({ content: `**❌ | Ocorreu um erro ao tentar banir o usuário.**`, ephemeral: true });
        }

        const embedSucesso = new EmbedBuilder()
            .setAuthor({ name: 'Comando Ban', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`✅ | O usuário ${usuarioAlvo} foi banido com sucesso.\n\n**Motivo:** ${motivo}`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor('Red')
            .setTimestamp();

        await interaction.reply({ embeds: [embedSucesso], ephemeral: true });

        const idCanalLogs = config.Logs;
        const canalLogs = client.channels.cache.get(idCanalLogs);

        if (canalLogs) {
            const embedLogs = new EmbedBuilder()
                .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
                .setTitle(`**Novo Ban Registrado**`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`👤 | **Usuário:** ${usuarioAlvo}\n👮 | **Banido por:** ${interaction.user}\n📋 | **Motivo:** ${motivo}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
                .setColor('Random')
                .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await canalLogs.send({ embeds: [embedLogs] });
        }
    }
};
