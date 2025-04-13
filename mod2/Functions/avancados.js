const { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, Webhook, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const { config, dbconfig } = require("../DatabaseJson");

async function outros(interaction, client) {

    const embed = new EmbedBuilder()
    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`👑 | Ola ${interaction.user} Você esta no painel de Configurações Avançadas`)
    .setColor("NotQuiteBlack")
    .setFooter({ text: 'Feito por Caiox - discord.gg/posse', iconURL: 'https://cdn.discordapp.com/icons/1212226623546593310/8f3c82b60be69c315fac04ceb89e1e6b.png?size=2048' })
    .setTimestamp();

    const selectMenu24 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('configoutros')
        .setPlaceholder('Escolha uma opção abaixo')
        .addOptions([
            {
                label: 'Proteção de usuarios',
                value: 'usuarioscomandos24',
                emoji: '1256675315187712051'
            },
            {
                label: 'Block Msg',
                value: 'msgprotect',
                emoji: '1268393568930627735'
            },
            {
                label: 'Enviar um anuncio',
                value: 'enviaranuncio',
                emoji: '1241888534957133938'
            }
        ])
    );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("voltar1")
        .setLabel("Voltar")
        .setStyle(2)
        .setEmoji("1264710894345130097")
    )

    await interaction.update({ embeds: [embed], components: [selectMenu24, row], ephemeral: true });
}




module.exports = {
    outros
}
