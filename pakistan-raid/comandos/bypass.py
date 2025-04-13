import discord
from discord.ext import commands
from discord import app_commands
import socket
import aiohttp
import re

class CloudflareBypass(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def tentar_bypass(self, domain):
        resultados = {}
        try:
            ip_cloudflare = socket.gethostbyname(domain)
            resultados['Cloudflare IP'] = ip_cloudflare

            headers = {"User-Agent": "Mozilla/5.0"}
            async with aiohttp.ClientSession() as session:
                subdoms = ["direct", "cpanel", "ftp", "webmail", "mail", "server", "dev", "admin", "ns1", "ns2"]
                achados = []

                for sub in subdoms:
                    try:
                        alvo = f"{sub}.{domain}"
                        ip = socket.gethostbyname(alvo)
                        if ip != ip_cloudflare:
                            achados.append(f"{alvo} -> {ip}")
                    except:
                        continue

                if achados:
                    resultados['Possíveis IP reais'] = achados
                else:
                    resultados['Possíveis IP reais'] = ["n achei porra nenhuma :("]

        except Exception as e:
            resultados['erro'] = str(e)

        return resultados

    @commands.command(name="cloudflarebypass")
    async def cf_prefix(self, ctx, domain: str):
        await self.executar_scan(ctx, domain)

    @app_commands.command(name="cloudflarebypass", description="Tenta burlar o cloudflare e achar IP real do site")
    @app_commands.describe(domain="domínio do site ex: site.com")
    async def cf_slash(self, interaction: discord.Interaction, domain: str):
        await interaction.response.defer()
        await self.executar_scan(interaction, domain)

    async def executar_scan(self, ctx, domain):
        embed = discord.Embed(title="Cloudflare Bypass", color=discord.Color.red())
        embed.add_field(name="Alvo", value=domain, inline=False)

        result = await self.tentar_bypass(domain)

        if "erro" in result:
            embed.description = f"Erro: `{result['erro']}`"
        else:
            embed.add_field(name="IP Cloudflare", value=result.get("Cloudflare IP", "desconhecido"), inline=False)
            achados = result.get("Possíveis IP reais", [])
            embed.add_field(name="Possíveis IP reais", value="\n".join(achados), inline=False)

        embed.set_footer(text="by pakistan hunters")
        if isinstance(ctx, commands.Context):
            await ctx.reply(embed=embed)
        else:
            await ctx.followup.send(embed=embed)

async def setup(bot):
    await bot.add_cog(CloudflareBypass(bot))
