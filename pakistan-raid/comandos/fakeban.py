import discord
from discord.ext import commands
from discord import app_commands
import random

class FakeBan(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.frases = [
            "foi banido por excesso de feiura",
            "banido por tentar molestar o bot",
            "banido por usar android 4.4 em 2025",
            "banido por ser muito burro",
            "banido por estar cheirando o bot",
            "banido por tentar dar cu no voice",
            "banido pq n paga o nitro mas quer spam de gif",
            "banido por mandar áudio gemendo 3h da manhã",
            "banido pq hackeou a própria conta e chorou no suporte",
            "banido por pedir pack do bot",
            "banido pq chamou o dev de corno",
            "banido pq deu rage no uno",
            "banido por existir num nível irritante",
            "banido por tentar invadir o servidor usando net do vizinho",
            "banido pq n sabe digitar e culpa o autocorreto",
            "banido por cheirar a cueca e gostar"
        ]

    @commands.command(name="fakeban")
    async def fakeban_prefix(self, ctx, user: discord.Member):
        motivo = random.choice(self.frases)
        await ctx.send(f"{user.mention} foi banido! Motivo: {motivo}")

    @app_commands.command(name="fakeban", description="ban fake em alguém")
    @app_commands.describe(user="quem vai tomar ban kkkkk")
    async def fakeban_slash(self, interaction: discord.Interaction, user: discord.Member):
        motivo = random.choice(self.frases)
        await interaction.response.send_message(f"{user.mention} foi banido! Motivo: {motivo}")

async def setup(bot):
    await bot.add_cog(FakeBan(bot))
