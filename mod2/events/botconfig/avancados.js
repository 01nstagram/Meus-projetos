const { ApplicationCommandType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, RoleSelectMenuBuilder } = require("discord.js");
const { owner } = require("../../config.json");
const { dbconfig } = require("../../DatabaseJson/index")
const { outros } = require("../../Functions/avancados")
const { protegido } = require("../../Functions/protegido")
const { msgblock } = require("../../Functions/msgsblock")

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId === 'configbot24' && interaction.values.includes('outros24')) {
            outros(interaction, client)
        }  
   
   
if (customId === 'configoutros' && interaction.values.includes('enviaranuncio')) {

    const botaosite24 = new ButtonBuilder()
    .setLabel('DiscoHook')
    .setURL('https://discohook.org/')
    .setStyle(5);

const botaoimportar24 = new ButtonBuilder()
    .setLabel('Importar')
    .setCustomId('importacaocodigo24')
    .setStyle(3)
    .setEmoji('1251585341895213118');

const botaoVoltar = new ButtonBuilder()
    .setCustomId("voltar2")
    .setLabel('Voltar')
    .setEmoji('1178068047202893869')
    .setStyle(2);

const row = new ActionRowBuilder()
    .addComponents(botaosite24, botaoimportar24, botaoVoltar);

const embed = new EmbedBuilder()
    .setAuthor({ name: 'System Anuncio - DiscoHook', iconURL: 'https://cdn.discordapp.com/emojis/990284971384111204.png?size=2048' })
    .setDescription('> Enviar um anuncio usando DiscoHook.')
    .setColor("DarkBlue")
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .addFields([
        { name: 'Help', value: '**Use o botão "DiscoHook" Para acessar o site e quando criar a mensagem que quer clique em Json Data Editor e volte pro discord e clique em Importar E cole o codigo la e clique em enviar.**' }
    ])
    .setFooter({ text: 'Sistema Anuncio Utilizando DiscoHook', iconURL: 'https://cdn.discordapp.com/emojis/1248300571522371686.png?size=2048' });

 await interaction.update({ embeds: [embed], components: [row], ephemeral: true})    
   }    
   
   if (customId === 'importacaocodigo24') {
    const modal = new ModalBuilder()
        .setCustomId('discohookModal')
        .setTitle('Importar JSON do DiscoHook');

    const jsoninput24 = new TextInputBuilder()
        .setCustomId('discohookJson24')
        .setLabel('Código JSON')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Cole aqui o código JSON gerado pelo DiscoHook')
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(jsoninput24);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}

if (customId === 'discohookModal') {
    const Jsonsalvar24 = interaction.fields.getTextInputValue('discohookJson24');

    try {
        const discohook24data24 = JSON.parse(Jsonsalvar24);

        if (!discohook24data24 || (!discohook24data24.content && !discohook24data24.embeds)) {
            throw new Error('** > ❌ | O Codigo "Json" Que Você Pois não possui o "Content" ou "embed"**');
        }

        const selecionarcanal24 = new ChannelSelectMenuBuilder()
            .setCustomId('selecioanrcanal24')
            .setPlaceholder('Selecione o canal para enviar o Anuncio')
            .setChannelTypes([ChannelType.GuildText]);

        const row = new ActionRowBuilder().addComponents(selecionarcanal24);

        await interaction.reply({
            content: '**✔ | Escolha Um Canal que será enviado o Anuncio:**',
            components: [row],
            ephemeral: true
        });

        interaction.client.tempJsonData = discohook24data24;

    } catch (error) {
        await interaction.reply({ content: `** > ❌ | Ocorreu um erro ao processar o codigo Json: ${error.message}**`, ephemeral: true });
    }
}

if (customId === 'selecioanrcanal24') {
    const selectedChannelId = interaction.values[0];
    const channel = interaction.guild.channels.cache.get(selectedChannelId);

    const discohook24data24 = interaction.client.tempJsonData;
    const content = discohook24data24.content || null;
    const embeds = discohook24data24.embeds ? discohook24data24.embeds.map(embed => new EmbedBuilder(embed)) : null;

    if (content && embeds) {
        await channel.send({ content, embeds });
    } else if (content) {
        await channel.send({ content });
    } else if (embeds) {
        await channel.send({ embeds });
    } else {
        await interaction.reply({ content: '** > ❌ | Não Foi Encontrada Nenhuma configuração funcionando encontrada.**', ephemeral: true });
        return;
    }

    await interaction.update({ content: `**✔ | Anuncio enviado com sucesso: ${channel}!**`, components: [], ephemeral: true });
}

if (customId === 'configoutros' && interaction.values.includes('usuarioscomandos24')) {
    protegido(interaction, client)     
}  

if (customId === 'addprotegido') {
    const modal = new ModalBuilder()
        .setCustomId('addprogetido_modal24')
        .setTitle('Adicionar IDs Protegidos');

    const porids24 = new TextInputBuilder()
        .setCustomId('idosdosusuarios24')
        .setLabel('Ids de Usuários')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Digite os IDs separados por vírgula');

    const row24 = new ActionRowBuilder().addComponents(porids24);
    modal.addComponents(row24);

    await interaction.showModal(modal);
}

if (interaction.isModalSubmit()) {
    if (interaction.customId === 'addprogetido_modal24') {
        const porids24 = interaction.fields.getTextInputValue('idosdosusuarios24');
        const ids = porids24.split(',').map(id => id.trim());

        const invalidosid = [];
        const validIds = [];

        ids.forEach(id => {
            if (id.match(/^\d{17,19}$/)) {
                validIds.push(id);
            } else {
                invalidosid.push(id);
            }
        });

        if (invalidosid.length > 0) {
            const invalidoembed24 = new EmbedBuilder()
                .setAuthor({ name: `Alerta`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`❌ | Encontrados **${invalidosid.length}** IDs inválidos\n\n**${invalidosid.join(', ')}**`)
                .setColor('Random')
                .setTimestamp();

            await interaction.reply({ embeds: [invalidoembed24], ephemeral: true });
        } else {
            await dbconfig.set(`${interaction.guild.id}.protegidos`, validIds);

          protegido(interaction, client)
        }
    }
}

if (customId === 'removeprotegido') {
    const modal = new ModalBuilder()
        .setCustomId('removeprotegido_modal24')
        .setTitle('Remover IDs Protegidos');

    const porids24 = new TextInputBuilder()
        .setCustomId('removerids24')
        .setLabel('IDs de Usuários')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Digite os IDs separados por vírgula');

    const row24 = new ActionRowBuilder().addComponents(porids24);
    modal.addComponents(row24);

    await interaction.showModal(modal);
}

if (interaction.isModalSubmit()) {
    if (interaction.customId === 'removeprotegido_modal24') {
        const bagulhola24 = interaction.fields.getTextInputValue('removerids24');
        const ids24 = bagulhola24.split(',').map(id => id.trim());

        const protegidos = await dbconfig.get(`${interaction.guild.id}.protegidos`) || [];
        const invalidosid = [];
        const removerids24 = [];
        const idsnaoencontrados24 = [];

        ids24.forEach(id => {
            if (!id.match(/^\d{17,19}$/)) {
                invalidosid.push(id);
            } else if (protegidos.includes(id)) {
                removerids24.push(id);
            } else {
                idsnaoencontrados24.push(id);
            }
        });

        if (invalidosid.length > 0) {
            const invalidEmbed = new EmbedBuilder()
                .setAuthor({ name: `Alerta`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`❌ | IDs inválidos encontrados: **${invalidosid.join(', ')}**`)
                .setColor('Random')
                .setTimestamp();

            await interaction.reply({ embeds: [invalidEmbed], ephemeral: true });
        }

        if (idsnaoencontrados24.length > 0) {
            const notFoundEmbed = new EmbedBuilder()
                .setAuthor({ name: `Alerta`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`❗ | IDs não encontrados na lista de protegidos: **${idsnaoencontrados24.join(', ')}**`)
                .setColor('Random')
                .setTimestamp();

            await interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
        }

        if (removerids24.length > 0) {
            const novosprotegidos24 = protegidos.filter(id => !removerids24.includes(id));
            await dbconfig.set(`${interaction.guild.id}.protegidos`, novosprotegidos24);
            
            protegido(interaction, client);
        }
    }
}

if (customId === 'addmsg') {
    const modal = new ModalBuilder()
        .setCustomId('addmsg_modal')
        .setTitle('Adicionar Mensagens Bloqueadas');

    const msgInput = new TextInputBuilder()
        .setCustomId('mensagens')
        .setLabel('Mensagens')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Digite as mensagens separadas por vírgula.');

    const row = new ActionRowBuilder().addComponents(msgInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
}

if (interaction.isModalSubmit()) {
    if (interaction.customId === 'addmsg_modal') {
        const mensagens = interaction.fields.getTextInputValue('mensagens').split(',').map(msg => msg.trim());
        const mensagensConfig = await dbconfig.get(`${interaction.guild.id}.msgs`) || [];
        const novasMensagens = [...mensagensConfig, ...mensagens];

        await dbconfig.set(`${interaction.guild.id}.msgs`, novasMensagens);

        msgblock(interaction, client);
    }
}

if (customId === 'removemsg') {
    const modal = new ModalBuilder()
        .setCustomId('removemsg_modal')
        .setTitle('Remover Mensagens Bloqueadas');

    const numInput = new TextInputBuilder()
        .setCustomId('numerosMensagens')
        .setLabel('Numeração das Mensagens')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Digite os números das mensagens que deseja remover, separados por vírgula.');

    const row = new ActionRowBuilder().addComponents(numInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
}

if (interaction.isModalSubmit()) {
    if (interaction.customId === 'removemsg_modal') {
        const numerosMensagens24 = interaction.fields.getTextInputValue('numerosMensagens').split(',').map(num => parseInt(num.trim(), 10) - 1);
        const mensagensConfig24 = await dbconfig.get(`${interaction.guild.id}.msgs`) || [];

        const invalidos = numerosMensagens24.filter(num => isNaN(num) || num < 0 || num >= mensagensConfig24.length);
        const mensagensAtualizadas24 = mensagensConfig24.filter((msg, index) => !numerosMensagens24.includes(index));

        if (invalidos.length > 0) {
            const invalido24 = invalidos.map(num => num + 1).join(', ');
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Alerta`, iconURL: `https://cdn.discordapp.com/emojis/1263258630849958020.gif?size=2048` })
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`❌ | você pois alguma numeração incorreta: **${invalido24}**`)
                .setColor('Random')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await dbconfig.set(`${interaction.guild.id}.msgs`, mensagensAtualizadas24);

        msgblock(interaction, client);
    }
}

if (interaction.customId === 'onoff') {
    const statusAtual = await dbconfig.get(`${interaction.guild.id}.status`) || false;
    const novoStatus = !statusAtual;
    await dbconfig.set(`${interaction.guild.id}.status`, novoStatus);
    await msgblock(interaction, client);
}





    }
    
};
