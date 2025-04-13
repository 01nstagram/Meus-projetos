const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('waifu')
        .setDescription('Receba uma imagem aleatória de uma waifu!'),

    async execute(interaction) {
        const button = new ButtonBuilder()
            .setCustomId('waifuButton')
            .setLabel('Obter Waifu')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'Clique no botão para receber uma imagem!',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};
