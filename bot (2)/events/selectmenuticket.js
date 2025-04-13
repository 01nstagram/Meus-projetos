const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs')


module.exports = {
    name: 'ticket',
    async execute(interaction) {
        
        if (interaction.isStringSelectMenu() && interaction.customId === "options_member") {
    
            const option = interaction.values[0];
        
            if (option === "suporte") {
                const modal = new Discord.ModalBuilder()
                .setCustomId("modal_ticket1")
                .setTitle(`necessita de suporte para quê?`);

              const suport_bot = new Discord.TextInputBuilder()
                .setCustomId('suport_ticket')
                .setLabel('Digite oque você precisa?')
                .setPlaceholder('Escreva aqui.')
                .setStyle(Discord.TextInputStyle.Short)
        
                modal.addComponents(
                    new Discord.ActionRowBuilder().addComponents(suport_bot)
                  );
                return interaction.showModal(modal);
            }
            
            else if (option === "report") {
                const modal = new Discord.ModalBuilder()
                .setCustomId("modal_ticket2")
                .setTitle(`oque você deseja reportar`);

              const suport_bot = new Discord.TextInputBuilder()
                .setCustomId('report_ticket')
                .setLabel('Digite oque você precisa?')
                .setPlaceholder('Escreva aqui.')
                .setStyle(Discord.TextInputStyle.Short)
        
                modal.addComponents(
                    new Discord.ActionRowBuilder().addComponents(suport_bot)
                  );
                return interaction.showModal(modal);


            }
            if (option === "duvida") {

                const modal = new Discord.ModalBuilder()
                .setCustomId("modal_ticket")
                .setTitle(`Qual é a sua duvida?`);

              const suport_bot = new Discord.TextInputBuilder()
                .setCustomId('duvida_ticket')
                .setLabel('Digite oque você precisa?')
                .setPlaceholder('Escreva aqui.')
                .setStyle(Discord.TextInputStyle.Short)
        
                modal.addComponents(
                    new Discord.ActionRowBuilder().addComponents(suport_bot)
                  );
                return interaction.showModal(modal);


            }
            

        }

    }
}