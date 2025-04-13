const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const { dbconfig } = require("../DatabaseJson/index");

async function paineladm(interaction, client) {
    const servers = client.guilds.cache.filter(guild => guild.id !== interaction.guild.id).map(guild => ({
        id: guild.id,
        name: guild.name,
        membross: guild.memberCount,
        Configurado: dbconfig.has(`${guild.id}`)
    }));

    let opcoes;

    if (servers.length === 0) {
        opcoes = [{
            label: 'Nenhum servidor disponivel',
            description: 'Não há outros servidores para gerenciar.',
            value: 'nenhum_servidor',
            emoji: '⚠️'
        }];
    } else {
        opcoes = servers.map(guild => ({
            label: guild.name,
            description: `Membros: ${guild.membross} | Configurado: ${guild.Configurado ? 'Sim' : 'Não'}`,
            value: guild.id,
            emoji: '1269773226960093184'
        }));
    }

    const menus24 = [];
    const rows24 = [];
    
    const tamanho24 = 25;
    for (let i = 0; i < opcoes.length; i += tamanho24) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`guildserver_${i / tamanho24 + 1}`)
            .setPlaceholder(`Selecione um servidor (${i / tamanho24 + 1})`)
            .addOptions(opcoes.slice(i, i + tamanho24));
        
        const row = new ActionRowBuilder().addComponents(selectMenu);
        rows24.push(row);
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setThumbnail("https://cdn.discordapp.com/emojis/1282019834632339557.png?size=2048")
        .setDescription(`⚠ | **Configuração do bot ${client.user}**\n\n> Gerencie todos os servidores que o seu bot está.\n- Não aparece para configurar o server atual que esta sendo executado o comando`)
        .setColor("#2f3136")
        .setFooter({ text: 'Caiox - discord.gg/posse', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("enviaranuncio")
        .setLabel("Enviar Anuncio geral")
        .setStyle(1)
        .setEmoji("1241888534957133938"),
        new ButtonBuilder()
        .setCustomId("enviarinvite24")
        .setLabel("Enviar Msg de convite")
        .setStyle(3)
        .setEmoji("1265796375262531675"),
        new ButtonBuilder()
        .setCustomId("voltar03")
        .setLabel("Atualizar")
        .setStyle(2)
        .setEmoji("1248736226706591907")
    );

    rows24.push(row4);

    if (interaction.message == undefined) {
        await interaction.reply({ embeds: [embed], components: rows24, ephemeral: true });
    } else {
        await interaction.update({ embeds: [embed], components: rows24, ephemeral: true });
    }
}

module.exports = {
    paineladm
};
