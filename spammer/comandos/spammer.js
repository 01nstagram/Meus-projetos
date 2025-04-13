const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spammer')
        .setDescription('Cria um botão invisível para outros, que envia uma mensagem 100 vezes quando pressionado.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Criando um botão que só pode ser usado pelo usuário que executou o comando
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`spammer_${userId}`)
                    .setLabel('Ativar Spam')
                    .setStyle(ButtonStyle.Primary)
            );

        // Respondendo à interação com o botão
        await interaction.reply({
            content: 'Clique no botão para ativar o spam!',
            components: [row],
            ephemeral: true // Tornar a mensagem visível apenas para quem executou o comando
        });
    },
};

// Em outro arquivo (ou na mesma lógica, mas em um arquivo separado), o código para lidar com o clique no botão:
const { InteractionType } = require('discord.js');

module.exports = {
    data: null, // Essa parte pode ser opcional dependendo de onde você colocar essa lógica
    async execute(interaction) {
        if (interaction.isButton()) {
            // Verificando se o botão pressionado é o correto
            const userId = interaction.user.id;
            if (!interaction.customId.startsWith(`spammer_${userId}`)) {
                return interaction.reply({
                    content: 'Este botão não é para você!',
                    ephemeral: true,
                });
            }

            // Respondendo ao clique no botão
            await interaction.reply({
                content: 'Spam iniciado, mensagens serão enviadas a cada segundo!',
                ephemeral: true,
            });

            // Enviar mensagens a cada 1 segundo
            let count = 0;
            const interval = setInterval(async () => {
                if (count >= 100) {
                    clearInterval(interval); // Para de enviar mensagens após 100 mensagens
                    return;
                }

                // Envia a mensagem de spam no mesmo canal onde o botão foi pressionado
                await interaction.channel.send(`Spam número: ${count + 1}`);
                count++;
            }, 1000); // Envia uma mensagem a cada 1 segundo
        }
    }
};
