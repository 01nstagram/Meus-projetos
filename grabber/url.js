const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js'); const dns = require('dns').promises; const fetch = require('node-fetch'); const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => { console.log('Bot online!'); await resetCommands(); });

async function resetCommands() { const commands = [ new SlashCommandBuilder() .setName('siteinfo') .setDescription('Obtém o IP, porta e painel admin de um site') .addStringOption(option => option.setName('url') .setDescription('URL do site') .setRequired(true) ), new SlashCommandBuilder() .setName('scan') .setDescription('Verifica vulnerabilidades comuns no site') .addStringOption(option => option.setName('url') .setDescription('URL do site') .setRequired(true) ) ].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

const fetch = require('node-fetch');

try {
    console.log('Resetando comandos...');
    await rest.put(Routes.applicationCommands(config.botId), { body: commands });
    console.log('Comandos registrados com sucesso!');
} catch (error) {
    console.error('Erro ao resetar comandos:', error);
}

}

client.on('interactionCreate', async interaction => { if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === 'siteinfo') {
    try {
        await interaction.deferReply({ flags: 64 }); // Responde imediatamente para evitar timeout

        const siteUrl = interaction.options.getString('url');
        if (!siteUrl) {
            return await interaction.editReply('Por favor, forneça uma URL válida.');
        }

        const parsedUrl = new URL(siteUrl);
        const hostname = parsedUrl.hostname;
        const port = parsedUrl.port || 80;
        const ip = (await dns.lookup(hostname)).address;

        await interaction.editReply(`🔍 **Informações do site:**\n🌐 **IP:** ${ip}\n📌 **Porta:** ${port}`);
    } catch (error) {
        console.error(error);
        await interaction.editReply('Erro ao obter as informações do site. Verifique a URL e tente novamente.');
    }
}

if (interaction.commandName === 'scan') {
    try {
        await interaction.deferReply({ flags: 64 });
        const siteUrl = interaction.options.getString('url');
        if (!siteUrl) {
            return await interaction.editReply('Por favor, forneça uma URL válida.');
        }

        const payloads = {
            sql: "' OR '1'='1", // Teste básico de SQL Injection
            xss: "<script>alert('XSS')</script>" // Teste básico de XSS
        };
        
        const sqlTest = await fetch(`${siteUrl}?test=${encodeURIComponent(payloads.sql)}`).then(res => res.text()).catch(() => 'Erro');
        const xssTest = await fetch(`${siteUrl}?test=${encodeURIComponent(payloads.xss)}`).then(res => res.text()).catch(() => 'Erro');
        
        let result = '🔍 **Resultado do Scan:**\n';
        result += sqlTest.includes("SQL") ? '⚠️ **Possível SQL Injection detectado!**\n' : '✅ **Nenhum SQL Injection aparente.**\n';
        result += xssTest.includes("<script>") ? '⚠️ **Possível XSS detectado!**' : '✅ **Nenhum XSS aparente.**';

        await interaction.editReply(result);
    } catch (error) {
        console.error(error);
        await interaction.editReply('Erro ao realizar o scan. Verifique a URL e tente novamente.');
    }
}

});

client.login(config.token);

