const { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require("discord.js");
const { config } = require("../../DatabaseJson");
const { paineladm } = require("../../Functions/paineladm");

module.exports = {
    name: "paineladm", 
    description: "[ 👑 Owner ] Configurar do bot", 
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => { 

        if (interaction.user.id !== config.get("owner") ) {
            return interaction.reply({ 
                content: `**❌ | So o \`Dono\` Pode utilizar o Comando.**`, 
                ephemeral: true 
            });
        }

        paineladm(interaction, client);
    }
};
