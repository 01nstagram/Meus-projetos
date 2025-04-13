require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const puppeteer = require('puppeteer');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Se for registrar em um servidor específico

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Função para passar por encurtadores simples com axios
async function bypassSimple(url) {
    try {
        const response = await axios.get(url, {
            maxRedirects: 0,
            validateStatus: status => status >= 300 && status < 400
        });
        return response.headers.location || null;
    } catch (error) {
        console.error(`❌ Erro ao desencurtar via axios: ${error.message}`);
        return null;
    }
}

// Função para encurtadores avançados com Puppeteer
async function bypassAdvanced(url) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Aguarda um possível redirecionamento
        await page.waitForTimeout(5000);
        const finalUrl = page.url();

        await browser.close();
        return finalUrl;
    } catch (error) {
        console.error(`❌ Erro no Puppeteer: ${error.message}`);
        if (browser) await browser.close();
        return null;
    }
}

// Função principal que decide qual método usar
async function bypassShortlink(url) {
    let finalUrl = await bypassSimple(url);
    if (!finalUrl) {
        console.log("🔄 Tentando método avançado...");
        finalUrl = await bypassAdvanced(url);
    }
    return finalUrl;
}

// Comando Slash para desencurtar
const commands = [
    new SlashCommandBuilder()
        .setName('desencurtar')
        .setDescription('Passa por um encurtador de link e retorna o link real na DM.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('O link encurtado')
                .setRequired(true)
        )
].map(command => command.toJSON());

// Registra os comandos na API do Discord
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        console.log('🚀 Registrando comandos...');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
})();

// Evento quando o bot está pronto
client.once('ready', () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

// Evento de interação (Slash Command)
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'desencurtar') {
        const url = interaction.options.getString('url');

        await interaction.reply({ content: '⏳ Processando o link, aguarde...', ephemeral: true });

        const realUrl = await bypassShortlink(url);

        if (realUrl) {
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🔗 Link Desencurtado')
                .setDescription(`**Link original:** [Clique aqui](${realUrl})`)
                .setFooter({ text: 'Envio privado para sua DM' });

            try {
                await interaction.user.send({ embeds: [embed] });
                await interaction.followUp({ content: '✅ O link real foi enviado na sua DM!', ephemeral: true });
            } catch (error) {
                await interaction.followUp({ content: '❌ Não consegui enviar na DM. Verifique se está aberta.', ephemeral: true });
            }
        } else {
            await interaction.followUp({ content: '❌ Não consegui resolver esse link.', ephemeral: true });
        }
    }
});

// Inicia o bot
client.login(TOKEN);