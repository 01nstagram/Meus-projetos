import discord
import json
from discord.ext import commands, tasks
import os

# Define the intents
intents = discord.Intents.default()
intents.messages = True  # Enable message intents
intents.guilds = True
intents.voice_states = True
intents.members = True
intents.message_content = True  # Necessário para ler mensagens e comandos

# Função para carregar os prefixos
def carregar_prefixos():
    if not os.path.exists("prefixos.json"):
        return {}
    with open("prefixos.json", "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

# Função para salvar o prefixo
def salvar_prefixo(guild_id, prefixo):
    prefixos = carregar_prefixos()
    prefixos[str(guild_id)] = prefixo
    with open("prefixos.json", "w") as f:
        json.dump(prefixos, f, indent=4)

# Função para pegar o prefixo de um servidor
async def get_prefix(bot, message):
    prefixos = carregar_prefixos()
    guild_id = str(message.guild.id)
    return prefixos.get(guild_id, "-")  # Se não houver prefixo, retorna o padrão "-"

# Inicializando o bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix=get_prefix, intents=intents)

bot.remove_command("help")

TARGET_CHANNEL_ID = 1354154181358915738

@bot.event
async def on_ready():
    print(f'✅ Bot logado como {bot.user}!')
    
    for filename in os.listdir("comandos"):
        if filename.endswith(".py"):
            try:
                await bot.load_extension(f"comandos.{filename[:-3]}")
                print(f"🔹 Comando {filename} carregado!")
            except Exception as e:
                print(f"⚠️ Erro ao carregar {filename}: {e}")

    try:
        await bot.tree.sync()
        print("🔄 Comandos sincronizados com o Discord!")
    except Exception as e:
        print(f"⚠️ Erro ao sincronizar comandos: {e}")

    change_status.start()  # inicia o loop do status


@bot.event
async def on_message(message):
    if message.author == bot.user:
        return  # Evita que o bot responda a si mesmo
    
    if message.channel.id == TARGET_CHANNEL_ID:
        await message.add_reaction('🇵🇰')  # Reage com a bandeira do Paquistão
    
    await bot.process_commands(message)  # Permite o processamento de comandos

async def update_status():
    total_members = sum(len(guild.members) for guild in bot.guilds)
    total_guilds = len(bot.guilds)

    await bot.change_presence(
        activity=discord.Activity(
            type=discord.ActivityType.listening,
            name=f"ajudando {total_members} membros em {total_guilds} servidores"
        ),
        status=discord.Status.idle
    )

@tasks.loop(seconds=5)
async def change_status():
    if change_status.current_loop % 2 == 0:
        await bot.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.listening,
                name=f"Meu criador x76 e Uxie"
            ),
            status=discord.Status.idle
        )
    else:
        await update_status()


@tasks.loop(seconds=5)
async def change_status():
    if change_status.current_loop % 2 == 0:
        await bot.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.listening,
                name=f"Meu criador x76 e Uxie"
            ),
            status=discord.Status.idle
        )
    else:
        await update_status()

bot.run("MTM1MzcyMzAwOTk0MDE5NzM4Nw.GF-QGp.LF6WBUIzkO8BDQajEC_KMnPPMA9iXNoCp3FNFA")
