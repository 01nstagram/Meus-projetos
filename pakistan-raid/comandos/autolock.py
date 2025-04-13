import discord
from discord.ext import commands, tasks
from discord import app_commands
import asyncio
from datetime import datetime
import pytz
import json
import os

class AutoLock(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.json_path = "autolock.json"
        self.locks = self.load_locks()
        self.check_loop.start()

    def load_locks(self):
        if not os.path.exists(self.json_path):
            # cria arquivo se não existir
            with open(self.json_path, "w") as f:
                json.dump({}, f)
            print("Arquivo autolock.json criado!")
            return {}

        with open(self.json_path, "r") as f:
            try:
                data = json.load(f)
                return {int(k): v for k, v in data.items()}
            except json.JSONDecodeError:
                print("Erro ao ler JSON, criando novo.")
                return {}

    def save_locks(self):
        with open(self.json_path, "w") as f:
            json.dump(self.locks, f, indent=4)

    @app_commands.command(name="autolock", description="Define lock automático em canais")
    @app_commands.describe(
        channel="Canal a ser bloqueado/desbloqueado",
        lock_time="Hora de lock (formato 24h: HH:MM)",
        unlock_time="Hora de unlock (formato 24h: HH:MM)"
    )
    async def autolock(self, interaction: discord.Interaction, channel: discord.TextChannel, lock_time: str, unlock_time: str):
        self.locks[channel.id] = {
            "lock": lock_time,
            "unlock": unlock_time,
            "guild_id": channel.guild.id
        }
        self.save_locks()

        await interaction.response.send_message(
            f"Canal {channel.mention} configurado: **lock às {lock_time}**, **unlock às {unlock_time}**",
            ephemeral=True
        )

    @tasks.loop(seconds=60)
    async def check_loop(self):
        agora = datetime.now(pytz.timezone("America/Sao_Paulo")).strftime("%H:%M")
        for chan_id, data in self.locks.items():
            guild = self.bot.get_guild(data["guild_id"])
            if guild:
                canal = guild.get_channel(chan_id)
                if canal:
                    try:
                        if agora == data["lock"]:
                            await canal.set_permissions(canal.guild.default_role, send_messages=False)
                            await canal.send("**Canal trancado automaticamente pela Pakistan Hunters**")
                        elif agora == data["unlock"]:
                            await canal.set_permissions(canal.guild.default_role, send_messages=True)
                            await canal.send("**Canal destrancado automaticamente pela Pakistan Hunters**")
                    except Exception as e:
                        print(f"Erro no canal {chan_id}: {e}")

    @check_loop.before_loop
    async def before_loop(self):
        await self.bot.wait_until_ready()

async def setup(bot):
    await bot.add_cog(AutoLock(bot))
