import discord
from discord.ext import commands
import json
import os
from datetime import datetime

DB_PATH = "data/calltime.json"
entrada_call = {}

def carregar_dados():
    if not os.path.exists(DB_PATH):
        return {}
    with open(DB_PATH, "r") as f:
        return json.load(f)

def salvar_dados(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=4)

class CallTracker(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        user_id = str(member.id)

        if before.channel is None and after.channel is not None:
            entrada_call[user_id] = datetime.utcnow().timestamp()

        elif before.channel is not None and after.channel is None:
            if user_id in entrada_call:
                saida = datetime.utcnow().timestamp()
                tempo_call = saida - entrada_call[user_id]
                data = carregar_dados()
                user_data = data.get(user_id, {})
                user_data["tempo_total"] = user_data.get("tempo_total", 0) + tempo_call
                user_data["ultima_data"] = datetime.utcnow().strftime("%d/%m/%Y, %H:%M:%S")
                data[user_id] = user_data
                salvar_dados(data)
                del entrada_call[user_id]

async def setup(bot):
    await bot.add_cog(CallTracker(bot))
