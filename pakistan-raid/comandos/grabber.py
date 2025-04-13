import discord
from discord.ext import commands
from discord import app_commands
import aiohttp
import re

class PasteGrabber(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def buscar_leaks(self, keyword):
        results = []
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"https://pastebin.com/search?q={keyword}") as resp:
                    html = await resp.text()
                    matches = re.findall(r"/[a-zA-Z0-9]{8}", html)
                    for m in set(matches):
                        results.append("https://pastebin.com" + m)
            except:
                pass

            try:
                async with session.get(f"https://www.stikked.com/search?q={keyword}") as resp:
                    html = await resp.text()
                    matches = re.findall(r"/view/[a-zA-Z0-9]+", html)
                    for m in set(matches):
                        results.append("https://www.stikked.com" + m)
            except:
                pass

        return results[:10]  # máximo 10 resultados

    @commands.command(name="pastegrabber")
    async def pastegrabber_prefix(self, ctx, *, palavra: str):
        await self.do_pastegrab(ctx, palavra)

    @app_commands.command(name="pastegrabber", description="Procura vazamentos por palavra-chave no pastebin e outros")
    @app_commands.describe(palavra="palavra tipo cpf, senha, discord, admin, etc")
    async def pastegrabber_slash(self, interaction: discord.Interaction, palavra: str):
        await interaction.response.defer()
        await self.do_pastegrab(interaction, palavra)

    async def do_pastegrab(self, ctx, palavra):
        embed = discord.Embed(title="Paste Leak Scanner", color=discord.Color.red())
        embed.add_field(name="Palavra buscada", value=palavra, inline=False)

        leaks = await self.buscar_leaks(palavra)

        if leaks:
            embed.add_field(name="Resultados encontrados", value='\n'.join(leaks), inline=False)
        else:
            embed.description = "Nenhum vazamento encontrado."

        embed.set_footer(text="by pakistan hunters")

        if isinstance(ctx, commands.Context):
            await ctx.reply(embed=embed)
        else:
            await ctx.followup.send(embed=embed)

async def setup(bot):
    await bot.add_cog(PasteGrabber(bot))
