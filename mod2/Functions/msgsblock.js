const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { dbconfig } = require("../DatabaseJson");

async function msgblock(interaction, client) {
    const mensagensConfig = await dbconfig.get(`${interaction.guild.id}.msgs`) || [];
    const status = await dbconfig.get(`${interaction.guild.id}.status`) || false;

    const mensagensList = mensagensConfig.length > 0
        ? mensagensConfig.map((msg, index) => `${index + 1}. ${msg}`).join('\n')
        : '**Nenhuma Mensagem Configurada.**';

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Block de mensagens', iconURL: 'https://cdn.discordapp.com/emojis/1277779898663964775.png?size=2048' })
        .setDescription(`- Olá Sr ${interaction.user}, Você está no painel de Bloquear mensagens.\n- O sistema de bloquear mensagens não permite que usuários enviem as mensagens que você configurou.`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Feito por Caiox・`, iconURL: `https://cdn.discordapp.com/avatars/1204440643271786560/becf5cc09ddcc8c8a1607c2236bb1fea.png?size=2048` })
        .setTimestamp()
        .addFields(
            { name: '**Mensagens Configuradas**', value: mensagensList, inline: true },
            { name: '**Status**', value: status ? "On" : "Off", inline: true }
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("addmsg")
            .setLabel("ㅤAdicionarㅤ")
            .setStyle(3),
        new ButtonBuilder()
            .setCustomId("removemsg")
            .setLabel("ㅤRemoverㅤ")
            .setStyle(4),
        new ButtonBuilder()
            .setCustomId("onoff")
            .setLabel(status ? "On" : "Off")
            .setEmoji(status ? "1040755017486962698" : "1084947072060502016")
            .setStyle(status ? 3 : 4),
        new ButtonBuilder()
            .setCustomId("voltar2")
            .setLabel("Voltar")
            .setEmoji("1251585346387443742")
            .setStyle(2)
    );

    await interaction.update({ embeds: [embed], components: [row], ephemeral: true });
}

module.exports = {
    msgblock
};
