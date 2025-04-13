import discord
from discord.ext import commands
import os
import importlib
import asyncio
import requests
from config import TOKEN, WEBHOOK_URL  # Importa as variáveis de configuração
from comandos.raid import setup_raid  # Importando diretamente a função de setup do comando raid
from comandos.raid import *

intents = discord.Intents.default()
intents.messages = True
intents.guilds = True

# Configuração do bot
bot = commands.Bot(command_prefix='.', intents=intents)

# Função para enviar logs para o webhook
async def send_log(content):
    try:
        data = {
            "content": content,
        }
        # Envia uma solicitação POST para o webhook
        requests.post(WEBHOOK_URL, json=data)
    except Exception as e:
        print(f"Erro ao enviar log para o webhook: {e}")

# Função para carregar os comandos
async def load_commands():
    # Carregar o comando raid explicitamente e aguardar
    await setup_raid(bot)

# Evento para quando o bot estiver online
@bot.event
async def on_ready():
    print(f'{bot.user} está online!')
    await send_log(f'{bot.user} está online.')

# Função principal para rodar o bot
async def run_bot():
    # Carregar os comandos
    await load_commands()

    # Iniciar o bot
    try:
        await bot.start(TOKEN)
    except Exception as e:
        print(f"Erro ao iniciar o bot: {e}")
        await send_log(f"Erro ao iniciar o bot: {e}")

# Executar o bot
if __name__ == "__main__":
    asyncio.run(run_bot())
