import discord
import json
from discord.ext import commands, tasks
import os
from datetime import datetime, timezone

# Webhooks
WEBHOOK_ERROS = "https://discord.com/api/webhooks/1360347754303455364/pyglqfwDzzW8_AYmwFnBHtMSbGQ-0qSQpr-RtY52sr1p5hWcxPuPv0_H9NAfuXlBqCvp"
WEBHOOK_STATUS = "https://discord.com/api/webhooks/1360347754303455364/pyglqfwDzzW8_AYmwFnBHtMSbGQ-0qSQpr-RtY52sr1p5hWcxPuPv0_H9NAfuXlBqCvp"

# Função pra mandar webhook
async def enviar_webhook(url, titulo, descricao, cor=0xff0000):
    embed = discord.Embed(
        title=titulo,
        description=descricao,
        color=cor,
       timestamp = datetime.now(timezone.utc)
    )
    async with bot.http._HTTPClient__session.post(url, json={
        "embeds": [embed.to_dict()]
    }) as resp:
        if resp.status != 204:
            print(f"Erro ao enviar webhook: {resp.status}")

# Intents
intents = discord.Intents.default()
intents.messages = True
intents.guilds = True
intents.voice_states = True
intents.members = True
intents.message_content = True

# Prefixos
def carregar_prefixos():
    if not os.path.exists("prefixos.json"):
        return {}
    with open("prefixos.json", "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def salvar_prefixo(guild_id, prefixo):
    prefixos = carregar_prefixos()
    prefixos[str(guild_id)] = prefixo
    with open("prefixos.json", "w") as f:
        json.dump(prefixos, f, indent=4)

async def get_prefix(bot, message):
    prefixos = carregar_prefixos()
    guild_id = str(message.guild.id)
    return prefixos.get(guild_id, "-")

# Bot
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
                await enviar_webhook(WEBHOOK_ERROS, "Erro ao carregar comando", f"`{filename}`\n```py\n{e}```")
                print(f"⚠️ Erro ao carregar {filename}: {e}")

    try:
        await bot.tree.sync()
        print("🔄 Comandos sincronizados com o Discord!")
    except Exception as e:
        await enviar_webhook(WEBHOOK_ERROS, "Erro ao sincronizar comandos", f"```py\n{e}```")
        print(f"⚠️ Erro ao sincronizar comandos: {e}")

    change_status.start()

import json
from datetime import datetime
from discord.ext import commands

import json
from datetime import datetime, timezone
from discord.ext import commands

@bot.event
async def on_voice_state_update(member, before, after):
    if member.bot:
        return

    try:
        with open("call_data.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}

    user_id = str(member.id)

    if after.channel and not before.channel:
        # entrou na call
        data[user_id] = data.get(user_id, {
            "tempo_total": 0
        })
        data[user_id]["call_atual"] = datetime.now(timezone.utc).isoformat()

    elif before.channel and not after.channel:
        # saiu da call
        if user_id in data and "call_atual" in data[user_id]:
            entrou = datetime.fromisoformat(data[user_id]["call_atual"]).replace(tzinfo=timezone.utc)
            tempo = (datetime.now(timezone.utc) - entrou).total_seconds()
            data[user_id]["tempo_total"] += int(tempo)
            data[user_id].pop("call_atual", None)

    with open("call_data.json", "w") as f:
        json.dump(data, f, indent=4)

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    if message.channel.id == TARGET_CHANNEL_ID:
        await message.add_reaction('🇵🇰')

    await bot.process_commands(message)

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

@bot.event
async def on_guild_join(guild):
    await enviar_webhook(
        WEBHOOK_STATUS,
        "Bot adicionado em servidor",
        f"**Nome:** `{guild.name}`\n**ID:** `{guild.id}`\n**Membros:** `{guild.member_count}`"
    )

@bot.event
async def on_guild_remove(guild):
    await enviar_webhook(
        WEBHOOK_STATUS,
        "Bot removido de servidor",
        f"**Nome:** `{guild.name}`\n**ID:** `{guild.id}`"
    )

@bot.event
async def on_command_error(ctx, error):
    await enviar_webhook(
        WEBHOOK_ERROS,
        "Erro em comando",
        f"**Comando:** `{ctx.command}`\n**Usuário:** `{ctx.author}`\n```py\n{error}```"
    )
    await ctx.send("deu erro doido kkkkk olha no webhook la")

bot.run("MTM1MzcyMzAwOTk0MDE5NzM4Nw.GF-QGp.LF6WBUIzkO8BDQajEC_KMnPPMA9iXNoCp3FNFA")

