import discord
from discord.ext import commands
from discord import app_commands
import json, os

ARQUIVO_PREFIXO = "prefixos.json"

def carregar_prefixos():
    if not os.path.exists(ARQUIVO_PREFIXO):
        return {}
    with open(ARQUIVO_PREFIXO, "r") as f:
        try:
            return json.load(f)
        except:
            return {}

class QualPrefixo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # comando prefixado
    @commands.command(name="qualprefixo")
    async def qualprefixo_prefix(self, ctx):
        prefixos = carregar_prefixos()
        guild_id = str(ctx.guild.id)
        prefixo = prefixos.get(guild_id, "-")
        await ctx.send(f"o prefixo desse servidor é `{prefixo}`")

    # comando barra (slash)
    @app_commands.command(name="qualprefixo", description="ver qual prefixo ta setado no servidor")
    async def qualprefixo_slash(self, interaction: discord.Interaction):
        prefixos = carregar_prefixos()
        guild_id = str(interaction.guild.id)
        prefixo = prefixos.get(guild_id, "-")
        await interaction.response.send_message(f"o prefixo desse servidor é `{prefixo}`", ephemeral=True)

    @qualprefixo_prefix.error
    async def qualprefixo_prefix_error(self, ctx, error):
        await ctx.send(f"erro: {error}")

async def setup(bot):
    await bot.add_cog(QualPrefixo(bot))
