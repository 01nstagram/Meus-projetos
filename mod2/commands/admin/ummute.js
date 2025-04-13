const { ApplicationCommandType, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
    name: "unmute",
    description: "[ Unmute ] Desmutar um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: 6,
            name: "usuario",
            description: "Usuário que será desmutado",
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

        const usuarioAlvo = interaction.options.getUser("usuario");
        const membro = interaction.guild.members.cache.get(usuarioAlvo.id);

        if (!membro) {
            return interaction.reply({ content: `**❌ | O usuário não está no servidor.**`, ephemeral: true });
        }

        if (membro.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: `**❌ | Não posso desmutar usuários com cargos mais altos ou iguais ao meu.**`, ephemeral: true });
        }

        const config = await dbconfig.get(interaction.guild.id);

        try {
            await membro.timeout(null, `Desmutado por ${interaction.user.tag}`);
        } catch (erro) {
            return interaction.reply({ content: `**❌ | Ocorreu um erro ao tentar desmutar o usuário.**`, ephemeral: true });
        }

        const embedSucesso = new EmbedBuilder()
            .setAuthor({ name: 'Comando Unmute', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`✅ | O usuário ${usuarioAlvo} foi desmutado com sucesso.`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor('Green')
            .setTimestamp();

        await interaction.reply({ embeds: [embedSucesso], ephemeral: true });

        const idCanalLogs = config.Logs;
        const canalLogs = client.channels.cache.get(idCanalLogs);

        if (canalLogs) {
            const embedLogs = new EmbedBuilder()
                .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
                .setTitle(`**Novo Unmute Registrado**`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`👤 | **Usuário:** ${usuarioAlvo}\n👮 | **Desmutado por:** ${interaction.user}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
                .setColor('Random')
                .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await canalLogs.send({ embeds: [embedLogs] });
        }
    }
};
