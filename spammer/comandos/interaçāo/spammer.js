const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spammer')
        .setDescription('Cria um botão invisível para outros, que envia uma mensagem 100 vezes quando pressionado.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Altere conforme necessário

    async execute(interaction) {
        const userId = interaction.user.id;

        // Criando um botão que só pode ser usado por quem executou o comando
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`spammer_${userId}`)
                    .setLabel('Ativar Spam')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ content: 'Clique no botão para ativar o spam!', components: [row], ephemeral: true });

        // Agora, ao pressionar o botão, o bot envia 100 mensagens
        const collector = interaction.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 15000 // Tempo para coletar interações (15 segundos)
        });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === `spammer_${userId}`) {
                // Verificando se a interação foi do mesmo usuário que executou o comando
                if (buttonInteraction.user.id === userId) {
                    try {
                        // Verificar se o canal está disponível
                        if (buttonInteraction.channel && buttonInteraction.channel.isTextBased()) {
                            // Enviando 100 mensagens no canal
                            for (let i = 0; i < 100; i++) {
                                await buttonInteraction.channel.send(`Mensagem de spam número ${i + 1}`);
                            }
                            await buttonInteraction.reply({ content: 'Spam ativado! 100 mensagens enviadas!', ephemeral: true });
                        } else {
                            await buttonInteraction.reply({ content: 'Erro: Não foi possível encontrar um canal válido!', ephemeral: true });
                        }
                    } catch (error) {
                        console.error('Erro ao enviar mensagens:', error);
                        await buttonInteraction.reply({ content: 'Houve um erro ao tentar enviar as mensagens. Tente novamente mais tarde.', ephemeral: true });
                    }
                } else {
                    await buttonInteraction.reply({ content: 'Você não tem permissão para ativar este comando!', ephemeral: true });
                }
            }
        });
    }
};