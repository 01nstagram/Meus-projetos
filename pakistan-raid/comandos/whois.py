import discord
from discord.ext import commands
from discord import app_commands
import whois
import re

class Whois(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def extrair_dominio(self, url):
        padrao = r"https?://(www\.)?"
        dominio = re.sub(padrao, "", url).split('/')[0]
        return dominio

    def gerar_embed(self, dominio, info):
        embed = discord.Embed(title=f"WHOIS de {dominio}", color=discord.Color.orange())
        embed.set_footer(text="by pakistan hunters")

        if isinstance(info, dict):
            for chave in ["domain_name", "registrar", "creation_date", "expiration_date", "status", "name_servers"]:
                valor = info.get(chave)
                if valor:
                    if isinstance(valor, list):
                        valor = "\n".join(str(v) for v in valor)
                    embed.add_field(name=chave.replace("_", " ").title(), value=str(valor), inline=False)
        else:
            embed.description = f"n consegui puxar nada de {dominio}"

        return embed

    @commands.command(name="whois")
    async def whois_prefix(self, ctx, url: str):
        dominio = self.extrair_dominio(url)
        try:
            info = whois.whois(dominio)
        except Exception as e:
            return await ctx.reply(f"deu pau no WHOIS: `{e}`")
        embed = self.gerar_embed(dominio, info)
        await ctx.reply(embed=embed)

    @app_commands.command(name="whois", description="Puxa WHOIS de uma URL")
    @app_commands.describe(url="URL do site (tipo https://exemplo.com)")
    async def whois_slash(self, interaction: discord.Interaction, url: str):
        await interaction.response.defer()
        dominio = self.extrair_dominio(url)
        try:
            info = whois.whois(dominio)
        except Exception as e:
            return await interaction.followup.send(f"deu pau no WHOIS: `{e}`")
        embed = self.gerar_embed(dominio, info)
        await interaction.followup.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Whois(bot))
