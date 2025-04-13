const { ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { painel, acoes } = require("../../Functions/painel");
const { dbconfig } = require("../../DatabaseJson/index");
const { outros } = require("../../Functions/avancados")
const { paineladm } = require("../../Functions/paineladm");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId.startsWith(`voltar1`)) {
            painel(interaction, client);
        }

        if (customId.startsWith(`voltar2`)) {
            outros(interaction, client);
        }
        if (customId.startsWith(`voltar03`)) {
            paineladm(interaction, client);
        }
    }
};
