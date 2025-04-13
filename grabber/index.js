const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { token, clientId, guildId } = require('./config.json'); // Armazene o token do bot e IDs no arquivo config.json

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });

// Registra o Slash Command ao iniciar o bot
client.once('ready', () => {
  console.log('Bot está online!');
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    guild.commands.create({
      name: 'limpar',
      description: 'Limpar sua conta no Discord (somente você pode usar)',
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'limpar') {
    // Verifica se quem executou o comando é o dono do bot
    if (interaction.user.id !== 'SEU_ID_AQUI') { // Substitua com seu ID do Discord
      return interaction.reply({
        content: 'Você não tem permissão para usar este comando!',
        ephemeral: true,
      });
    }

    // Solicita o token do usuário
    await interaction.reply({
      content: 'Por favor, forneça seu **token** do bot para continuar.',
      ephemeral: true,
    });

    // Espera a resposta do usuário com o token
    const filter = (message) => message.author.id === interaction.user.id;
    const tokenMessage = await interaction.channel.awaitMessages({
      filter,
      max: 1,
      time: 60000, // Tempo limite de 60 segundos
      errors: ['time'],
    }).catch(() => {
      return interaction.followUp({ content: 'Você não forneceu o token a tempo!', ephemeral: true });
    });

    const token = tokenMessage.first().content; // O token inserido pelo usuário

    // Criação do Select Menu com as opções
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('limpar_options')
      .setPlaceholder('Escolha uma ação...')
      .addOptions([
        { label: 'Limpar DMs', value: 'clear_dms' },
        { label: 'Excluir DMs', value: 'delete_dms' },
        { label: 'Limpar e Excluir DMs', value: 'clear_delete_dms' },
        { label: 'Desfazer Amizades', value: 'unfriend' },
        { label: 'Fazer tudo', value: 'do_all' }
      ]);

    // Embed para exibir o menu
    const embed = new EmbedBuilder()
      .setColor('Black')
      .setTitle('Limpeza de Conta')
      .setDescription('Escolha uma das opções abaixo para limpar sua conta:')
      .setThumbnail('URL_DO_BANNER_AQUI') // Coloque a URL do banner que você deseja
      .setFooter({ text: 'Escolha com sabedoria!' });

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Envia o menu para o usuário
    await interaction.followUp({ embeds: [embed], components: [row] });

    // Lida com a seleção do menu
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: 'SELECT_MENU',
      time: 15000
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Você não pode usar este menu!', ephemeral: true });
      }

      const action = i.values[0];
      
      switch (action) {
        case 'clear_dms':
          await i.reply('Limpar DMs...');
          await clearDMs(i.user);
          break;
        case 'delete_dms':
          await i.reply('Excluir DMs...');
          await deleteDMs(i.user);
          break;
        case 'clear_delete_dms':
          await i.reply('Limpar e excluir DMs...');
          await clearDMs(i.user);
          await deleteDMs(i.user);
          break;
        case 'unfriend':
          await i.reply('Desfazendo amizades...');
          await unfriend(i.user);
          break;
        case 'do_all':
          await i.reply('Fazendo todas as ações...');
          await clearDMs(i.user);
          await deleteDMs(i.user);
          await unfriend(i.user);
          break;
        default:
          await i.reply('Ação desconhecida.');
          break;
      }
    });
  }
});

// Função para limpar as DMs
async function clearDMs(user) {
  const dmChannel = await user.createDM();
  const messages = await dmChannel.messages.fetch({ limit: 100 });
  messages.forEach((msg) => msg.delete());
  console.log(`Limpei as DMs de ${user.tag}`);
}

// Função para excluir as DMs
async function deleteDMs(user) {
  const dmChannel = await user.createDM();
  const messages = await dmChannel.messages.fetch({ limit: 100 });
  messages.forEach((msg) => msg.delete());
  console.log(`Excluí as DMs de ${user.tag}`);
}

// Função para desfazer amizades
async function unfriend(user) {
  await user.removeFriend();
  console.log(`Desfiz amizade com ${user.tag}`);
}

// Comando para iniciar o bot
client.login(token);
