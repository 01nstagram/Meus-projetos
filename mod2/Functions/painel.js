const { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, Webhook, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const { config, dbconfig } = require("../DatabaseJson");

async function painel(interaction, client) {

    const embed = new EmbedBuilder()
    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`⚠ | **Configuração do sistema de moderação**\n\n> Use o menu abaixo para selecionar as opções de configuração.`)
    .setColor("#2f3136")
    .setFooter({ text: 'Feito por Caiox - discord.gg/posse', iconURL: 'https://cdn.discordapp.com/icons/1212226623546593310/8f3c82b60be69c315fac04ceb89e1e6b.png?size=2048' })
    .setTimestamp();

    const selectMenu24 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('configbot24')
        .setPlaceholder('Escolha uma opção abaixo')
        .addOptions([
            {
                label: 'Configurar Canais',
                value: 'configchannel',
                emoji: '1213254227724341300'
            },
            {
                label: 'Configurar Cargos',
                value: 'configroles',
                emoji: '1270783013478727842'
            },
            {
                label: 'Users avançadas',
                value: 'usersavancados',
                emoji: '1238672086164049930'
            },
            {
                label: 'Outros',
                value: 'outros24',
                emoji: '1065711564533006396'
            }
        ])
    );

    if (interaction.message == undefined) {
        await interaction.reply({ embeds: [embed], components: [selectMenu24], ephemeral: true });
      } else {
        await interaction.update({ embeds: [embed], components: [selectMenu24], ephemeral: true });
      }
}

async function acoes(interaction, client) {
    const users24 = await dbconfig.get(`${interaction.guild.id}.usersperms`);
    const mencionaroscara24 = users24 && users24.length > 0
        ? users24.map(id => `<@${id}>`).join(', ')
        : '**Não Configurado**';

    const embed = new EmbedBuilder()
    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`👤 | **Configure quem poderar usar os comandos sem precisar utilizar cargos.**`)
    .setColor("Aqua")
    .setFooter({ text: 'discord.gg/posse', iconURL: interaction.guild.iconURL({ dynamic: true }) })
    .setTimestamp()
    .addFields(
        { name: 'Usuarios com permissões', value: mencionaroscara24 }
    )

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("configusers")
        .setLabel("Adicionar")
        .setStyle(3)
        .setEmoji("1269773214415061062"),
        new ButtonBuilder()
        .setCustomId("removerusers")
        .setLabel("Remover")
        .setStyle(4)
        .setEmoji("1269773207544664084"),
        new ButtonBuilder()
        .setCustomId("voltar1")
        .setLabel("Voltar")
        .setStyle(2)
        .setEmoji("1264710894345130097")
    )

    await interaction.update({ embeds: [embed], components: [row], ephemeral: true });
}



module.exports = {
    painel,
    acoes
}
