const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = './data/ipbans.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ipban')
    .setDescription('bloqueia user fake por ip (json kkk)')
    .addUserOption(opt => opt.setName('user').setDescription('alvo').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    let db = [];
    if (fs.existsSync(path)) db = JSON.parse(fs.readFileSync(path));
    if (!db.includes(user.id)) {
      db.push(user.id);
      fs.writeFileSync(path, JSON.stringify(db));
    }
    await interaction.reply(`${user.tag} banido por IP fake kkkkk`);
  }
};