import discord
from discord.ext import commands
from discord import app_commands
import random

class Transar(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    frases = [
        "vocês transaram tão forte q o chão rachou",
        "foram 47 minutos de pura selvageria",
        "transaram ouvindo mc pipokinha e choraram dps",
        "foi tanta pressão q o colchão pediu arrego",
        "transaram e o bot ficou com inveja"
    ]

    @commands.command(name="transar")
    async def transar_prefix(self, ctx, user: discord.Member):
        frase = random.choice(self.frases)
        await ctx.reply(f"{ctx.author.mention} transou com {user.mention} — {frase}")

    @app_commands.command(name="transar", description="transa com alguém (de mentirinha kkk)")
    @app_commands.describe(user="quem tu vai transar")
    async def transar_slash(self, interaction: discord.Interaction, user: discord.Member):
        frase = random.choice(self.frases)
        await interaction.response.send_message(f"{interaction.user.mention} transou com {user.mention} — {frase}")

async def setup(bot):
    await bot.add_cog(Transar(bot))
