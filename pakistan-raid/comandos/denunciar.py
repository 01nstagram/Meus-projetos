import discord
from discord.ext import commands
from discord import app_commands
import aiohttp

class Denunciar(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def enviar_denuncia(self, invite, prova=None):
        url = "https://dis.gd/report"
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "server": invite,
            "reason": "scams",
            "details": f"Provas: {prova}" if prova else "Sem provas"
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=data) as resp:
                return resp.status == 200

    @commands.command(name="denunciar")
    async def denunciar_prefix(self, ctx, invite: str, *, prova: str = None):
        await ctx.reply("enviando denúncia pro discord...")
        sucesso = await self.enviar_denuncia(invite, prova)
        if sucesso:
            await ctx.send("denúncia enviada com sucesso")
        else:
            await ctx.send("falha ao enviar denúncia, tenta manual no https://dis.gd/report")

    @app_commands.command(name="denunciar", description="Denuncia um servidor direto no Discord")
    @app_commands.describe(invite="Invite do servidor (ex: discord.gg/123)", prova="Link da prova (opcional)")
    async def denunciar_slash(self, interaction: discord.Interaction, invite: str, prova: str = None):
        await interaction.response.defer()
        sucesso = await self.enviar_denuncia(invite, prova)
        if sucesso:
            await interaction.followup.send("denúncia enviada com sucesso")
        else:
            await interaction.followup.send("erro ao enviar, tenta manual: https://dis.gd/report")

async def setup(bot):
    await bot.add_cog(Denunciar(bot))
