const { ApplicationCommandType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, RoleSelectMenuBuilder } = require("discord.js");
const { owner } = require("../../config.json");
const { dbconfig } = require("../../DatabaseJson/index")
const { acoes } = require("../../Functions/painel")
const { msgblock } = require("../../Functions/msgsblock")

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId === 'configbot24' && interaction.values.includes('configchannel')) {
            const channel = interaction.guild.channels.cache.get(await dbconfig.get(`${interaction.guild.id}.Logs`)) || "`Não Definido`";
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({ name: 'Configurar canal de logs', iconURL: 'https://cdn.discordapp.com/emojis/1204587040788709437.png?size=2048'})
                    .setDescription(`> Configure o canal de logs do seu servidor.\n > Canal Atual: (${channel})`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ChannelSelectMenuBuilder()
                                .setCustomId(`selecionarcanal24444`)
                                .setChannelTypes(ChannelType.GuildText)
                                .setMaxValues(1)
                                .setPlaceholder("Selecione um canal para as logs")
                        ),
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("voltar1")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("1264710894345130097")
                        )
                ],
                ephemeral: true
            });
        }

        if (customId === `selecionarcanal24444`) {
            const id = interaction.values[0];
            await dbconfig.set(`${interaction.guild.id}.Logs`, id);
            await embedreply24();
        }

        function embedreply24() {
            const channel = interaction.guild.channels.cache.get(dbconfig.get(`${interaction.guild.id}.Logs`)) || "`Não Definido`";
            interaction.update({                 embeds: [
                new EmbedBuilder()
                .setAuthor({ name: 'Configurar canal de logs', iconURL: 'https://cdn.discordapp.com/emojis/1204587040788709437.png?size=2048'})
                .setDescription(`> Configure o canal de logs do seu servidor.\n > Canal Atual: (${channel})`)
            ],                components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ChannelSelectMenuBuilder()
                        .setCustomId(`selecionarrole24`)
                        .setMaxValues(1)
                        .setPlaceholder("Selecione Um cargo")
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("1264710894345130097")
                    )
            ], ephemeral: true });
        }

        if (customId === 'configbot24' && interaction.values.includes('configroles')) {
            const roles = (await dbconfig.get(`${interaction.guild.id}.roles`)) || [];
            const role4 = roles.length > 0
                ? roles.map(role244 => `<@&${role244}>`).join(", ")
                : "Nenhum Cargo Definido";
            
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({ name: 'Configurar Cargos', iconURL: 'https://cdn.discordapp.com/emojis/1270783013478727842.png?size=2048'})
                    .setDescription(`> Configure os cargos permitidos para utilizar os comandos.\n > Cargos Configurados: ${role4}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new RoleSelectMenuBuilder()
                                .setCustomId(`selecionarrole24`)
                                .setMaxValues(4)
                                .setPlaceholder("Configure os cargos permitidos.")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("voltar1")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("1264710894345130097")
                        )
                ],
                ephemeral: true
            });
        }
        
        if (customId === `selecionarrole24`) {
            const selectedRoles = interaction.values;
            await dbconfig.set(`${interaction.guild.id}.roles`, selectedRoles);
            await embedrole24();
        }
        
        async function embedrole24() {
            const roles = (await dbconfig.get(`${interaction.guild.id}.roles`)) || [];
            const role4 = roles.length > 0
                ? roles.map(role244 => `<@&${role244}>`).join(", ")
                : "Nenhum Cargo Definido";
            
            interaction.update({                 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({ name: 'Configurar Cargos', iconURL: 'https://cdn.discordapp.com/emojis/1270783013478727842.png?size=2048'})
                    .setDescription(`> Configure os cargos permitidos para utilizar os comandos.\n > Cargos Configurados: ${role4}`)
                ],                
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new RoleSelectMenuBuilder()
                                .setCustomId(`selecionarrole24`)
                                .setMaxValues(4)
                                .setPlaceholder("Configure os cargos permitidos.")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("voltar1")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("1264710894345130097")
                        )
                ],
                ephemeral: true 
            });
        }
        
        if (customId === 'configbot24' && interaction.values.includes('usersavancados')) {
            acoes(interaction, client)
        }

        if (customId === 'configoutros' && interaction.values.includes('msgprotect')) {
            msgblock(interaction, client)
        }

        if (customId === 'configusers') {
            const modal = new ModalBuilder()
                .setCustomId('userIdsModal')
                .setTitle('Configurar Perms Avançadas');
        
            const userids24 = new TextInputBuilder()
                .setCustomId('userIds24')
                .setLabel('Ids dos Usuários (separados por vírgula)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Exemplo: ID2, ID2')
                .setRequired(true);
        
            const mostrarcaiox = new ActionRowBuilder().addComponents(userids24);
            modal.addComponents(mostrarcaiox);
        
            await interaction.showModal(modal);
        }
        
        if (interaction.isModalSubmit() && interaction.customId === 'userIdsModal') {
            const userids24 = interaction.fields.getTextInputValue('userIds24');
            const users24 = userids24.split(',').map(id => id.trim());
        
            let idsinvalidos24 = [];
            for (const id of users24) {
                if (!/^\d{17,19}$/.test(id)) {
                    idsinvalidos24.push(id);
                }
            }
        
            if (idsinvalidos24.length > 0) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Alerta`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`❌ | Encontrados **${idsinvalidos24.length}** IDs inválidos\n\n**${idsinvalidos24.join(', ')}**`)
                    .setColor("Random")
                    .setTimestamp();
        
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await dbconfig.set(`${interaction.guild.id}.usersperms`, users24);
                await acoes(interaction, client);
            }
        }

        if (customId === 'removerusers') {
            const modal = new ModalBuilder()
                .setCustomId('removerusers24')
                .setTitle('Remover Usuarios das Permissões avançads');
        
            const sla24 = new TextInputBuilder()
                .setCustomId('removeoscaras24')
                .setLabel('Ids dos usuarios (separados por vírgula)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Exemplo: ID1, ID2')
                .setRequired(true);
        
            const mostrarcavaleirolindo = new ActionRowBuilder().addComponents(sla24);
            modal.addComponents(mostrarcavaleirolindo);
        
            await interaction.showModal(modal);
        }
        
        if (interaction.isModalSubmit() && interaction.customId === 'removerusers24') {
            const usuariospararemover24 = interaction.fields.getTextInputValue('removeoscaras24');
            const usuariosid24 = usuariospararemover24.split(',').map(id => id.trim());
        
            let idsinvalidos24 = [];
            let idsnaoencontrados24 = [];
            const usuarios24 = await dbconfig.get(`${interaction.guild.id}.usersperms`) || [];
        
            for (const id of usuariosid24) {
                if (!/^\d{17,19}$/.test(id)) {
                    idsinvalidos24.push(id);
                } else if (!usuarios24.includes(id)) {
                    idsnaoencontrados24.push(id);
                }
            }
        
            if (idsinvalidos24.length > 0) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Alerta`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`❌ | Encontrados **${idsinvalidos24.length}** IDs invalidos\n\n**${idsinvalidos24.join(', ')}**`)
                    .setColor("Random")
                    .setTimestamp();
        
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (idsnaoencontrados24.length > 0) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Aviso`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`⚠️ | **${idsnaoencontrados24.length}** IDs não foram encontrados na lista:\n\n**${idsnaoencontrados24.join(', ')}**`)
                    .setColor("Random")
                    .setTimestamp();
        
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const atualizarusuario24 = usuarios24.filter(userId => !usuariosid24.includes(userId));
        
                await dbconfig.set(`${interaction.guild.id}.usersperms`, atualizarusuario24);

        
                await acoes(interaction, client);
            }
        }
        
        


    }
    
};
