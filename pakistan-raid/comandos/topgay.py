import discord
from discord.ext import commands
from discord import app_commands
import random

class TopGay(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def gerar_ranking(self, membros):
        membros = [m for m in membros if not m.bot]
        ranking = random.sample(membros, min(10, len(membros)))
        return [(m, random.randint(70, 100)) for m in ranking]

    def criar_embed(self, ranking):
        embed = discord.Embed(
            title="🏳️‍🌈 Ranking dos Mais Viados 🏳️‍🌈",
            description="top 10 mais passivo do servidor kkk",
            color=0xff69b4
        )
        for i, (membro, porra) in enumerate(ranking, start=1):
            embed.add_field(name=f"#{i} - {membro.name}", value=f"gayzisse: **{porra}%**", inline=False)
        return embed

    @commands.command(name="topgay")
    async def topgay_prefix(self, ctx):
        ranking = self.gerar_ranking(ctx.guild.members)
        embed = self.criar_embed(ranking)
        await ctx.send(embed=embed)

    @app_commands.command(name="topgay", description="ranking dos mais gays do servidor")
    async def topgay_slash(self, interaction: discord.Interaction):
        ranking = self.gerar_ranking(interaction.guild.members)
        embed = self.criar_embed(ranking)
        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(TopGay(bot))
