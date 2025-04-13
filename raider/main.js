const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Função para verificar se o servidor está na blacklist
function isServerBlacklisted(guildId) {
  const data = JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
  return data.blacklist.includes(guildId);
}

// Função para adicionar um servidor à blacklist
function addToBlacklist(guildId) {
  const data = JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
  if (!data.blacklist.includes(guildId)) {
    data.blacklist.push(guildId);
    fs.writeFileSync('./blacklist.json', JSON.stringify(data, null, 2));
  }
}

// Comando de nuke
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'nuke') {
    const guildId = message.guild.id;

    // Verificando se o servidor está na blacklist
    if (isServerBlacklisted(guildId)) {
      return message.reply("Este servidor está na blacklist e não pode usar o comando `nuke`.");
    }

    // Verificando se o comando foi executado por um administrador
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply("Você precisa de permissões de administrador para usar esse comando.");
    }

    // Realizando o nuke: trocando nome e foto do servidor
    try {
      await message.guild.setName('Servidor Nukeado');
      await message.guild.setIcon('https://linkdaimagem.com/exemplo.png'); // Substitua pelo link da imagem desejada
      message.reply("Servidor nukeado com sucesso!");
    } catch (error) {
      console.error(error);
      message.reply("Ocorreu um erro ao tentar nuke o servidor.");
    }
  }

  // Comando para adicionar à blacklist
  if (command === 'blacklist') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply("Você precisa de permissões de administrador para usar esse comando.");
    }

    const targetGuildId = args[0]; // O ID do servidor que deve ser adicionado à blacklist

    if (!targetGuildId) {
      return message.reply("Você precisa fornecer o ID do servidor.");
    }

    addToBlacklist(targetGuildId);
    message.reply(`Servidor com ID ${targetGuildId} foi adicionado à blacklist.`);
  }

  // Comando para visualizar servidores na blacklist
  if (command === 'showblacklist') {
    const data = JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
    const blacklist = data.blacklist;

    if (blacklist.length === 0) {
      return message.reply("A blacklist está vazia.");
    }

    const embed = new EmbedBuilder()
      .setTitle('Servidores na Blacklist')
      .setDescription(blacklist.join('\n'))
      .setColor(Colors.Blue); // Usando a constante do Discord.js para definir a cor correta

    message.reply({ embeds: [embed] });
  }

  // Comando de invite (gerar link de convite para o servidor)
  if (command === 'invite') {
    const invite = await message.guild.invites.create(message.channel.id, {
      maxAge: 0, // Sem expiração
      unique: true // Gera um link único
    });
    message.reply(`Aqui está o link de convite para o servidor: ${invite.url}`);
  }

  // Comando de nuker completo (apaga canais, cria canais, troca nome, etc)
  if (command === 'nuker') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply("Você precisa de permissões de administrador para usar esse comando.");
    }

    // Definindo a cor para os embeds
    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('Iniciando o Nuke...')
      .setDescription('O servidor está sendo nukeado!');

    // Enviar o embed de aviso
    message.channel.send({ embeds: [embed] });

    // Trocar o nome e a foto do servidor
    try {
      await message.guild.setName('Servidor Nukeado');
      await message.guild.setIcon('https://linkdaimagem.com/exemplo.png');
    } catch (error) {
      console.error(error);
      return message.reply("Erro ao tentar nuke o servidor.");
    }

    // Apagar canais do servidor (se possível)
    const channels = message.guild.channels.cache;
    channels.forEach(async (channel) => {
      if (channel.deletable) {
        try {
          await channel.delete();
        } catch (error) {
          console.error(`Erro ao deletar o canal ${channel.id}:`, error);
        }
      }
    });

    // Criar canais aleatórios como parte do nuker
    for (let i = 0; i < 10; i++) {
      try {
        await message.guild.channels.create(`canal-nuke-${i}`, { type: 'GUILD_TEXT' });
      } catch (error) {
        console.error(`Erro ao criar o canal ${i}:`, error);
      }
    }

    message.reply("Servidor nukeado com sucesso!");
  }
});

// Iniciar o bot
client.login('MTM1NDU4OTE1NDM5NDExNjMxOA.GSlarj.AFhHsTJr4hQHDd0GDAQ0fNlENEegDIsBXCK3zY'); // Substitua pelo seu token do bot
