const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create_embed")
    .setDescription("📩 Envia uma embed personalizada.")
    .addStringOption(option =>
      option.setName("titulo")
        .setDescription("Título da embed")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("descricao")
        .setDescription("Descrição da embed")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("color")
        .setDescription("Cor da embed (hexadecimal)")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("imagem")
        .setDescription("URL da imagem para a embed")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("footer")
        .setDescription("Texto do rodapé da embed")
        .setRequired(false)),

  async execute(interaction) {
    const title = interaction.options.getString("titulo");
    const description = interaction.options.getString("descricao");
    let color = interaction.options.getString("color");
    const image = interaction.options.getString("imagem");
    const footer = interaction.options.getString("footer");

    if (color) {
      if (!isValidHexColor(color)) {
        return interaction.reply({ content: "❌ Isso não é uma cor hexadecimal válida!", ephemeral: true });
      }
      color = color.replace("#", ""); // Remove "#" para evitar erros no Discord.js
    }

    if (image && !isValidImageURL(image)) {
      return interaction.reply({ content: "❌ URL de imagem inválida!", ephemeral: true });
    }

    const embed = new EmbedBuilder().setTitle(title);

    if (description) embed.setDescription(description);
    if (color) embed.setColor(`#${color}`); // Define a cor corretamente
    if (image) embed.setImage(image);
    if (footer) embed.setFooter({ text: footer });

    try {
      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: "✅ Embed enviada com sucesso!", ephemeral: true });
    } catch (error) {
      console.error("Erro ao enviar embed:", error);
      await interaction.reply({ content: "❌ Ocorreu um erro ao tentar enviar a embed.", ephemeral: true });
    }
  }
};

function isValidImageURL(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === "http:" || urlObject.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function isValidHexColor(color) {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color); // Aceita cores com ou sem "#"
}