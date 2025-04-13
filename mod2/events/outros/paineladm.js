const { ApplicationCommandType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, RoleSelectMenuBuilder } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson/index");
const { paineladm } = require("../../Functions/paineladm");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId.startsWith('guildserver_')) {
            const idServidorSelecionado = interaction.values[0];
            const servidorSelecionado = client.guilds.cache.get(idServidorSelecionado);
        
            if (!servidorSelecionado) {
                return interaction.reply({
                    content: '⚠️ | **Erro**: Servidor não encontrado',
                    ephemeral: true
                });
            }
        
            const configurado = dbconfig.has(`${idServidorSelecionado}`);
            const config = dbconfig.get(`${idServidorSelecionado}`) || {};
        
            const canalLogs = config.Logs ? `<#${config.Logs}>` : '`Não configurado`';
            const cargos = config.roles?.length ? config.roles.map(roleId => `<@&${roleId}>`).join(', ') : '`Não configurado`';
            const usuariosPerms = config.usersperms?.length ? config.usersperms.map(userId => `<@${userId}>`).join(', ') : '`Não configurado`';
            const protegidos = config.protegidos?.length ? config.protegidos.map(userId => `<@${userId}>`).join(', ') : '`Não configurado`';
        
            const botoes = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('deleteConfig')
                        .setLabel('Deletar Configurações')
                        .setEmoji("1277489005205655572")
                        .setStyle(4),
                    new ButtonBuilder()
                        .setCustomId('removeBot')
                        .setLabel('Remover Bot')
                        .setEmoji("1212472699612434432")
                        .setStyle(4),
                    new ButtonBuilder()
                        .setCustomId('createInvite')
                        .setLabel('Criar Convite')
                        .setEmoji("1268725745027387434")
                        .setStyle(1),
                    new ButtonBuilder()
                        .setCustomId('voltar03')
                        .setEmoji("1264710894345130097")
                        .setStyle(2)
                );
        
            const embed = new EmbedBuilder()
                .setTitle(`Server: **${servidorSelecionado.name}**`)
                .setDescription(`**Membros**: \`${servidorSelecionado.memberCount}\`\n**Configurado**: ${configurado ? '✅' : '❌'}`)
                .setColor('#5865F2')
                .setThumbnail(servidorSelecionado.iconURL({ dynamic: true }))
                .addFields(
                    { name: '☁ | Logs', value: canalLogs, inline: true },
                    { name: '🎭 | Cargos', value: cargos, inline: true },
                    { name: '👥 | Usuarios com Perm', value: usuariosPerms, inline: true },
                    { name: '💎 | Usuarios Protegidos', value: protegidos, inline: true },
                    { name: '🔒 | Status block msg', value: config.status ? 'Ativado' : 'Desativado', inline: true },
                    { name: '🆔 | ID do Servidor', value: `\`${idServidorSelecionado}\``, inline: false }
                )
                .setFooter({ text: 'Clique nos botões abaixo para gerenciar' })
                .setTimestamp();
        
            await interaction.update({ embeds: [embed], components: [botoes] });
        }
        

        if (customId === 'deleteConfig') {
            const idServidorSelecionado = interaction.message.embeds[0]?.fields.find(f => f.name === '🆔 | ID do Servidor')?.value.replace(/`/g, '');

            if (!dbconfig.has(`${idServidorSelecionado}`)) {
                return interaction.reply({
                    content: '⚠️ | **Erro**: Esse servidor não esta configurado',
                    ephemeral: true
                });
            }

            dbconfig.delete(`${idServidorSelecionado}`);

            const config = dbconfig.get(`${idServidorSelecionado}`) || {};

            const canalLogs = config.Logs ? `<#${config.Logs}>` : '`Não configurado`';
            const cargos = config.roles?.length ? config.roles.map(roleId => `<@&${roleId}>`).join(', ') : '`Não configurado`';
            const usuariosPerms = config.usersperms?.length ? config.usersperms.map(userId => `<@${userId}>`).join(', ') : '`Não configurado`';
            const protegidos = config.protegidos?.length ? config.protegidos.map(userId => `<@${userId}>`).join(', ') : '`Não configurado`';

            const configurado = dbconfig.has(`${idServidorSelecionado}`);
            const embedAtualizada = new EmbedBuilder()
                .setTitle(`Server: **${interaction.guild.name}**`)
                .setDescription(`**Membros**: \`${interaction.guild.memberCount}\`\n**Configurado**: ${configurado ? '✅' : '❌'}`)
                .setColor('#5865F2')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '☁ | Logs', value: canalLogs, inline: true },
                    { name: '🎭 | Cargos', value: cargos, inline: true },
                    { name: '👥 | Usuarios com Perm', value: usuariosPerms, inline: true },
                    { name: '💎 | Usuarios Protegidos', value: protegidos, inline: true },
                    { name: '🔒 | Status block msg', value: config.status ? 'Ativado' : 'Desativado', inline: true },
                    { name: '🆔 | ID do Servidor', value: `\`${idServidorSelecionado}\``, inline: false }
                )
                .setFooter({ text: 'Clique nos botões abaixo para gerenciar' })
                .setTimestamp();

            await interaction.update({ embeds: [embedAtualizada], components: [] });
            await interaction.reply({
                content: `🗑️ | **Sucesso**: Configurações do servidor **${idServidorSelecionado}** foram deletadas com sucesso.`,
                ephemeral: true
            });
        }

        if (customId === 'removeBot') {
            const idServidorSelecionado = interaction.message.embeds[0]?.fields.find(f => f.name === '🆔 | ID do Servidor')?.value.replace(/`/g, '');
            const servidorSelecionado = client.guilds.cache.get(idServidorSelecionado);

            if (!servidorSelecionado) {
                return interaction.reply({
                    content: '⚠️ | **Erro**: Servidor não encontrado!',
                    ephemeral: true
                });
            }

            await servidorSelecionado.leave();
            paineladm(interaction, client);
        }

        if (customId === 'createInvite') {
            const idServidorSelecionado = interaction.message.embeds[0]?.fields.find(f => f.name === '🆔 | ID do Servidor')?.value.replace(/`/g, '');
            const servidorSelecionado = client.guilds.cache.get(idServidorSelecionado);

            if (!servidorSelecionado) {
                return interaction.reply({
                    content: '⚠️ | **Erro**: Servidor não encontrado!',
                    ephemeral: true
                });
            }

            const canal = servidorSelecionado.channels.cache.find(canal => canal.type === ChannelType.GuildText && canal.permissionsFor(servidorSelecionado.members.me).has('CreateInstantInvite'));
            if (!canal) {
                return interaction.reply({
                    content: '⚠️ | **Erro**: Não foi possível criar um convite.',
                    ephemeral: true
                });
            }

            const convite = await canal.createInvite({ maxAge: 0, maxUses: 1 });
            await interaction.reply({
                content: `🔗 | **Sucesso**: Convite criado com sucesso: \`${convite.url}\``,
                ephemeral: true
            });
        }
        if (customId === 'enviarinvite24') {

            const siteButton = new ButtonBuilder()
                .setLabel('DiscoHook')
                .setURL('https://discohook.org/')
                .setStyle(5);
            
            const importButton = new ButtonBuilder()
                .setLabel('Enviar')
                .setCustomId('importCode')
                .setStyle(3)
                .setEmoji('1251585341895213118');
            
            const backButton = new ButtonBuilder()
                .setCustomId("voltar03")
                .setEmoji('1178068047202893869')
                .setStyle(2);
            
            const actionRow = new ActionRowBuilder()
                .addComponents(siteButton, importButton, backButton);
            
            const embedInvite = new EmbedBuilder()
                .setAuthor({ name: 'System Convite - DiscoHook', iconURL: 'https://cdn.discordapp.com/emojis/990284971384111204.png?size=2048' })
                .setDescription('> Enviar um Convite para adicionar o bot no server DiscoHook.')
                .setColor("DarkBlue")
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .addFields([
                    { name: 'Help', value: '**Use o botão "DiscoHook" Para acessar o site.**' }
                ])
                .setFooter({ text: 'Sistema Convite Link', iconURL: 'https://cdn.discordapp.com/emojis/1248300571522371686.png?size=2048' });
            
            await interaction.update({ embeds: [embedInvite], components: [actionRow], ephemeral: true });
        }
        
        if (customId === 'importCode') {
            const modalDiscohook = new ModalBuilder()
                .setCustomId('discohookModalID')
                .setTitle('Importar JSON do DiscoHook');
        
            const jsonInput = new TextInputBuilder()
                .setCustomId('jsonInputID')
                .setLabel('Código JSON')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Cole aqui o código JSON gerado pelo DiscoHook')
                .setRequired(true);
        
            const modalActionRow = new ActionRowBuilder().addComponents(jsonInput);
            modalDiscohook.addComponents(modalActionRow);
        
            await interaction.showModal(modalDiscohook);
        }
        
        if (customId === 'discohookModalID') {
            const sabejson24 = interaction.fields.getTextInputValue('jsonInputID');
        
            try {
                const input24 = JSON.parse(sabejson24);
        
                if (!input24 || (!input24.content && !input24.embeds)) {
                    throw new Error('** > ❌ | O Codigo "Json" Que Você Pois não possui o "Content" ou "embed"**');
                }
        
                const channel24 = new ChannelSelectMenuBuilder()
                    .setCustomId('selectChannelID')
                    .setPlaceholder('Selecione o canal para enviar o Anuncio')
                    .setChannelTypes([ChannelType.GuildText]);
        
                const rowselect24 = new ActionRowBuilder().addComponents(channel24);
        
                await interaction.reply({
                    content: '**✔ | Escolha Um Canal que será enviado o Anuncio:**',
                    components: [rowselect24],
                    ephemeral: true
                });
        
                interaction.client.tempJsonData = input24;
        
            } catch (error) {
                await interaction.reply({ content: `** > ❌ | Ocorreu um erro ao processar o codigo Json: ${error.message}**`, ephemeral: true });
            }
        }
        
        if (customId === 'selectChannelID') {
            const selecionadocanal = interaction.values[0];
            const channel = interaction.guild.channels.cache.get(selecionadocanal);
        
            const tempDiscohookData = interaction.client.tempJsonData;
            const content = tempDiscohookData.content || null;
            const embeds = tempDiscohookData.embeds ? tempDiscohookData.embeds.map(embed => new EmbedBuilder(embed)) : null;

            const row24 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setEmoji("1251919083595890838")
                .setLabel("Adicionar bot")
                .setStyle(5)
                .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot`)
            )
        
            if (content && embeds) {
                await channel.send({ content, embeds, components: [row24] });
            } else if (content) {
                await channel.send({ content, components: [row24] });
            } else if (embeds) {
                await channel.send({ embeds, components: [row24] });
            } else {
                await interaction.reply({ content: '** > ❌ | Não Foi Encontrada Nenhuma configuração funcionando encontrada.**', ephemeral: true });
                return;
            }
        
            await interaction.update({ content: `**✔ | Anuncio enviado com sucesso: ${channel}!**`, components: [], ephemeral: true });
        }

    }
};
