const { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require("discord.js");
const { config } = require("../../DatabaseJson");
const { painel } = require("../../Functions/painel");

module.exports = {
    name: "painel", 
    description: "[ 👑 Owner ] Configurar o sistema de moderação", 
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => { 

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ 
                content: `**❌ | Você não tem permissão de \`Administrador\` Para utilizar o Comando.**`, 
                ephemeral: true 
            });
        }

        painel(interaction, client);
    }
};
