const { EmbedBuilder } = require("@discordjs/builders");
const { dbconfig } = require("../../DatabaseJson");

module.exports = {
    name: "messageCreate",
    run: async (message, client) => {
        if (message.author.bot) return;

        const guildConfig = await dbconfig.get(`${message.guild.id}`) || {};
        const { status, msgs, roles, usersperms, protegidos } = guildConfig;

        if (!status) return;

        if (protegidos.includes(message.author.id)) return;

        const possuiCargoProtegido = message.member.roles.cache.some(role => roles.includes(role.id));
        if (possuiCargoProtegido) return;

        const mensagemBloqueada = msgs.find(msg => message.content.includes(msg));

        if (mensagemBloqueada) {
            await message.delete().catch(console.error);

        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Alerta - Block Msg', iconURL: 'https://cdn.discordapp.com/emojis/1262197032458649682.png?size=2048' })
        .setTitle(`System - Palavra Bloqueada`)
        .setDescription(`👤 | Usuario: **${message.author.tag}**\n📢 | Ação: **A mensagem foi deletada**\n💬 | Mensagem Proibida: **${message.content}**`)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp()

            const logsChannel = guildConfig.Logs ? message.guild.channels.cache.get(guildConfig.Logs) : null;
            if (logsChannel) {
                logsChannel.send({ embeds: [embed] });
            }
        }
    }
};
