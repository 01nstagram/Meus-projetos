const { ApplicationCommandType, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
    name: "mute", 
    description: "[ Mute ] Mutar um usuário", 
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: 6,
            name: "usuario",
            description: "Usuario que sera mutado",
            required: true
        },
        {
            type: 3,
            name: "tempo",
            description: "Tempo (s - segundos, m - minutos, h - horas)",
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const config = await dbconfig.get(interaction.guild.id);

            if (!config) {
                return interaction.reply({ content: `**❌ | Você ainda não configurou seu servidor, utilize /painel.**`, ephemeral: true });
            }

            const cargosUsuario24 = interaction.member.roles.cache.map(role => role.id);
            const temCargo24 = config.roles.some(role => cargosUsuario24.includes(role));
            const temPermissao = config.usersperms.includes(interaction.user.id);

            if (!temCargo24 && !temPermissao) {
                return interaction.reply({ 
                    content: `**❌ | Você não tem permissão para utilizar este comando.**`, 
                    ephemeral: true 
                });
            }
        }

        const usuarioqueseramutado24 = interaction.options.getUser("usuario");
        const tempotextos24 = interaction.options.getString("tempo").toLowerCase();
        const membro = interaction.guild.members.cache.get(usuarioqueseramutado24.id);

        if (!membro) {
            return interaction.reply({ content: `**❌ | O usuário não está no servidor.**`, ephemeral: true });
        }

        if (membro.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: `**❌ | Não posso mutar usuários com cargos mais altos ou iguais ao meu.**`, ephemeral: true });
        }

        const config = await dbconfig.get(interaction.guild.id);
        const usuariosProtegidos24 = config.protegidos || [];

        if (usuariosProtegidos24.includes(usuarioqueseramutado24.id)) {
            return interaction.reply({ content: `**❌ | Não é possível mutar usuários que estão na lista de protegidos.**`, ephemeral: true });
        }

        let tempo;
        if (tempotextos24.endsWith("s")) {
            tempo = parseInt(tempotextos24) * 1000;
        } else if (tempotextos24.endsWith("m")) {
            tempo = parseInt(tempotextos24) * 60000;
        } else if (tempotextos24.endsWith("h")) {
            tempo = parseInt(tempotextos24) * 3600000;
        } else {
            return interaction.reply({ content: `**❌ | Formato de tempo inválido. Use s, m ou h.**`, ephemeral: true });
        }

        try {
            await membro.timeout(tempo, `Mutado por ${interaction.user.tag} | Tempo: ${tempotextos24}`);
        } catch (erro) {
            return interaction.reply({ content: `**❌ | Ocorreu um erro ao tentar mutar o usuário.**`, ephemeral: true });
        }

        const embedSucesso = new EmbedBuilder()
            .setAuthor({ name: 'Comando Mute', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`✅ | O usuário ${usuarioqueseramutado24} foi mutado com sucesso por **${tempotextos24}**.`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor('Green')
            .setTimestamp();

        await interaction.reply({ embeds: [embedSucesso], ephemeral: true });

        const idCanalLogs = config.Logs;
        const canalLogs = client.channels.cache.get(idCanalLogs);

        if (canalLogs) {
            const embedLogs = new EmbedBuilder()
                .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
                .setTitle(`**Novo Mute Registrado**`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`👤 | **Usuário:** ${usuarioqueseramutado24}\n👮 | **Mutado por:** ${interaction.user}\n⏳ | **Tempo:** ${tempotextos24}\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
                .setColor('Random')
                .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await canalLogs.send({ embeds: [embedLogs] });
        }
    }
};
