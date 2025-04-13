const { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, Webhook, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const { config, dbconfig } = require("../DatabaseJson");

async function protegido(interaction, client) {
    const protegidos = await dbconfig.get(`${interaction.guild.id}.protegidos`) || [];

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Proteção de Usuarios', iconURL: 'https://cdn.discordapp.com/emojis/1277779898663964775.png?size=2048' })
        .setDescription(`- Olá Sr ${interaction.user}, Você está no painel de Proteção de Usuários.\n- O sistema de proteção impede que comandos sejam usados contra usuários protegidos.`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Feito por Caiox・`, iconURL: `https://cdn.discordapp.com/avatars/1204440643271786560/becf5cc09ddcc8c8a1607c2236bb1fea.png?size=2048` })
        .setTimestamp()
        .addFields(
            {
                name: '**Usuarios Protegidos Dos Comandos**',
                value: protegidos.length > 0 ? protegidos.map(id => `<@${id}>`).join(', ') : '**Nenhum usuario configurado.**'
            }
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("addprotegido")
            .setLabel("ㅤAdicionarㅤ")
            .setStyle(3),
        new ButtonBuilder()
            .setCustomId("removeprotegido")
            .setLabel("ㅤRemoverㅤ")
            .setStyle(4),
        new ButtonBuilder()
            .setCustomId("voltar2")
            .setLabel("Voltar")
            .setEmoji("1251585346387443742")
            .setStyle(2)
    );

    await interaction.update({ embeds: [embed], components: [row], ephemeral: true });
}





module.exports = {
    protegido
}
