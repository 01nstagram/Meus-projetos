const { EmbedBuilder, PermissionFlagsBits, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { dbconfig } = require("../../DatabaseJson");
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');

module.exports = {
  name: "sorteio",
  description: "[ 🤖 Admin ] Criar Sorteios",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "tempo",
      description: "Defina o tempo do sorteio (ex: 1h, 30m, 45s)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "prêmio",
      description: "Qual será o prêmio",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "vencedores",
      description: "Número de vencedores do sorteio",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "produto",
      description: "O que será enviado no privado do usuário que ganhar o sorteio",
      type: ApplicationCommandOptionType.String,
      required: true,
    }
  ],
  run: async (client, interaction) => {
    const config = await dbconfig.get(interaction.guild.id);
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && 
        !config.roles.some(role => interaction.member.roles.cache.has(role)) && 
        !config.usersperms.includes(interaction.user.id)) {
      return interaction.reply({ content: `❌ | Você não tem permissão para usar este comando.`, ephemeral: true });
    }

    const tempo = interaction.options.getString("tempo");
    const premio = interaction.options.getString("prêmio");
    const vencedores = interaction.options.getInteger("vencedores");
    const produto = interaction.options.getString("produto");
    const sorteioId = uuidv4();

    const tempoMs = ms(tempo);
    if (!tempoMs) {
      return interaction.reply({ content: `❌ | Tempo inválido fornecido. Use formatos como 1h, 30m, 45s.`, ephemeral: true });
    }

    const sorteioEmbed = new EmbedBuilder()
      .setTitle("🎉 **SORTEIO INICIADO!** 🎉")
      .setDescription(`📅 **ID do Sorteio:** \`${sorteioId}\`\n🎁 **Prêmio:** ${premio}\n🏆 **Vencedores:** ${vencedores}\n⏰ **Tempo:** ${tempo}\n\n> Reaja com 🎉 para participar!`)
      .setColor("Purple")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp(Date.now() + tempoMs)
      .setFooter({ text: `Sorteio termina em`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

    const sorteioMsg = await interaction.channel.send({ embeds: [sorteioEmbed] });
    await sorteioMsg.react("🎉");

    interaction.reply({ content: `🎉 | Sorteio iniciado com sucesso!`, ephemeral: true });

    setTimeout(async () => {
      const sorteioMensagem = await interaction.channel.messages.fetch(sorteioMsg.id);
      const reacoes = sorteioMensagem.reactions.cache.get("🎉");

      if (!reacoes) return interaction.channel.send("**❌ | Não houve participantes suficientes para o sorteio.**");

      const users = await reacoes.users.fetch();
      const participantes = users.filter(user => !user.bot).map(user => user.id);

      if (participantes.length < vencedores) {
        return interaction.channel.send("**❌ | Não houve participantes suficientes para o sorteio.**");
      }

      const ganhadores = [];
      for (let i = 0; i < vencedores; i++) {
        const vencedor = participantes[Math.floor(Math.random() * participantes.length)];
        ganhadores.push(`<@${vencedor}>`);
        participantes.splice(participantes.indexOf(vencedor), 1);

        const user = await client.users.fetch(vencedor);
        user.send(`**🎉 | Parabéns! Você venceu o sorteio com ID \`${sorteioId}\`!\n💚 | Seu prêmio é: __${produto}__**`);
      }

      const finalEmbed = new EmbedBuilder()
        .setTitle("🎉 **SORTEIO ENCERRADO!** 🎉")
        .setDescription(`📅 **ID do Sorteio:** \`${sorteioId}\`\n🎁 **Prêmio:** ${premio}\n\n**Vencedor(es):**\n${ganhadores.join("\n")}`)
        .setColor("Green")
        .setFooter({ text: "Parabéns aos vencedores!", iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.channel.send({ embeds: [finalEmbed] });

      const logChannelId = config.Logs;
      const logChannel = client.channels.cache.get(logChannelId);

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setAuthor({ name: 'Logs de Comando', iconURL: 'https://cdn.discordapp.com/emojis/1270780955925155953.png?size=2048' })
          .setTitle(`**Novo Sorteio Registrado**`)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`📅 **ID do Sorteio:** \`${sorteioId}\`\n🎁 **Prêmio:** ${premio}\n🏆 **Vencedores:** ${vencedores}\n⏰ **Tempo:** ${tempo}\n👤 **Criado por:** ${interaction.user}`)
          .setColor('Random')
          .setFooter({ text: `${interaction.guild.name} ・`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        
        await logChannel.send({ embeds: [logEmbed] });
      }
    }, tempoMs);
  }
};
