const { ApplicationCommandType, EmbedBuilder, PermissionsBitField } = require("discord.js"); // Chamando a Dependencia discord.js
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
    name: "clear", 
    description: "[ Clear ] Limpar chats", 
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: 4,
            name: "quantidade",
            description: "Quantidade de mensagens para limpar",
            required: true
        }
    ],
    run: async (client, interaction) => { 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const config = await dbconfig.get(interaction.guild.id);

            if (!config) {
                return interaction.reply({ content: `**❌ | Você ainda não configurou seu servidor, utilize /painel.**`, ephemeral: true });
            }

            const userRoles = interaction.member.roles.cache.map(role => role.id);
            const hasRole = config.roles.some(role => userRoles.includes(role));
            const hasUserPermission = config.usersperms.includes(interaction.user.id);

            if (!hasRole && !hasUserPermission) {
                return interaction.reply({ 
                    content: `**❌ | Você não tem permissão para utilizar este comando.**`, 
                    ephemeral: true 
                });
            }
        }

        const quantidade = interaction.options.getInteger("quantidade");
        
        if (!quantidade || quantidade <= 0) {
            return interaction.reply({ content: `**❌ | Quantidade inválida.**`, ephemeral: true });
        }

        if (quantidade > 100) {
            return interaction.reply({ content: `**❌ | Você só pode apagar até 100 mensagens de uma vez.**`, ephemeral: true });
        }

        const channel = interaction.channel;
        const messages = await channel.messages.fetch({ limit: quantidade });
        await channel.bulkDelete(messages);

        const embed24 = new EmbedBuilder()
            .setAuthor({ name: 'Comando Clear', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`✅ | **${quantidade}** mensagens foram removidas com sucesso.\n\n**Detalhes:**\n- **Canal:** ${channel}\n`)
            .setColor('Green')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed24], ephemeral: true });

        const logChannelId = (await dbconfig.get(interaction.guild.id)).Logs;
        const logChannel = client.channels.cache.get(logChannelId);

        if (logChannel) {
            const logembeds24 = new EmbedBuilder()
                .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
                .setTitle(`**Novas logs encontradas**`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`👤 | **Usuário:** ${interaction.user}\n☁ | **Comando Executado:** Clear\n🧹 | **Mensagens Apagadas:** **${quantidade}**\n🕒 | **Data e Hora da Execução:** ${new Date().toLocaleString()}`)
                .setColor("Random")
                .setFooter({ text: `${interaction.guild.name}・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await logChannel.send({ embeds: [logembeds24] });
        }
    }
};
