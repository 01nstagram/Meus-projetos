client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'menu_help') return;

  const categoria = interaction.values[0];
  let embed = new EmbedBuilder().setColor('#00FFFF');

  switch (categoria) {
    case 'util':
      embed.setTitle('Comandos de Utilidades').setDescription('`/ping`, `/userinfo`, `/serverinfo`, `/avatar`');
      break;
    case 'diversao':
      embed.setTitle('Comandos de Diversão').setDescription('`/gay`, `/beijar`, `/piada`, `/ship`, `/coinflip`');
      break;
    case 'staff':
      embed.setTitle('Comandos de Staff').setDescription('`/ban`, `/kick`, `/mute`, `/warn`, `/clear`');
      break;
    case 'automod':
      embed.setTitle('Comandos de AutoMod').setDescription('`/antilink`, `/antiinvite`, `/capslock`');
      break;
    case 'owner':
      embed.setTitle('Comandos de Dono').setDescription('`/eval`, `/reload`, `/setstatus`');
      break;
    default:
      embed.setTitle('Erro').setDescription('Categoria inválida mano');
      break;
  }

  await interaction.update({ embeds: [embed], components: [] });
});
