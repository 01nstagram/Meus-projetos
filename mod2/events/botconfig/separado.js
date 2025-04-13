const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ChannelType } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson/index");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        const { customId, guild } = interaction;

        async function criarCanalAnuncios(guild) {
            let categoria = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory);
            let canalAnuncio = guild.channels.cache.find(c => c.name === 'anuncios' && c.type === ChannelType.GuildText);

            if (!canalAnuncio) {
                canalAnuncio = await guild.channels.create({
                    name: '📢 | anuncios',
                    type: ChannelType.GuildText,
                    parent: categoria?.id || null
                });
            }

            dbconfig.set(`${guild.id}.canalaviso`, canalAnuncio.id);
            return canalAnuncio;
        }

        async function verificarServidores() {
            const servidores = client.guilds.cache.map(guild => guild); 
            const servidoresSemCanal = [];

            for (const guild of servidores) {
                if (!dbconfig.has(`${guild.id}.canalaviso`)) {
                    const canalAnuncio = await criarCanalAnuncios(guild);
                    servidoresSemCanal.push({
                        guildId: guild.id,
                        canalId: canalAnuncio.id
                    });
                }
            }

            return servidoresSemCanal;
        }

        await verificarServidores();

        if (customId === 'enviaranuncio') {
            const modal = new ModalBuilder()
                .setCustomId('enviarAnuncioModal')
                .setTitle('Enviar Anuncio Para Todos Os Servers');

            const mensagemInput = new TextInputBuilder()
                .setCustomId('mensagemAnuncio')
                .setLabel('Digite a mensagem de anuncio')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(mensagemInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && customId === 'enviarAnuncioModal') {
            const mensagem = interaction.fields.getTextInputValue('mensagemAnuncio');
            const servidores = client.guilds.cache.map(guild => guild); 

            for (const guild of servidores) {
                const canalId = dbconfig.get(`${guild.id}.canalaviso`);
                let canalAnuncio = guild.channels.cache.get(canalId);

                if (!canalAnuncio) {
                    canalAnuncio = await criarCanalAnuncios(guild);
                }

                const anuncioFormatado = mensagem.replace(/\n/g, '\\n');

                if (canalAnuncio) {
                    await canalAnuncio.send({ content: anuncioFormatado });
                }
            }

            await interaction.reply({ content: '**✔ | Anuncio enviado para todos os servers com sucesso**', ephemeral: true });
        }
    }
};
