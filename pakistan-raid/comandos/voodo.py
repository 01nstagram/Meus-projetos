import discord
from discord.ext import commands
from discord import app_commands
import random

class Voodoo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    mensagens_voodoo = [
        "seu ip foi vazado e ta em 3 fóruns da darkweb",
        "detectamos comportamento suspeito na sua conta",
        "você está sendo rastreado pelo bot hunter",
        "atividade incomum identificada em seu token",
        "seu antivírus foi desativado remotamente",
        "sua geolocalização foi capturada: você está em perigo",
        "sua senha foi alterada por terceiros",
        "sua webcam foi ativada remotamente",
        "sua conta será desconectada em 30 segundos",
        "você foi adicionado numa blacklist da interweb"
    ]

    @commands.command(name='voodoo')
    async def voodoo_prefix(self, ctx, member: discord.Member):
        msg = random.choice(self.mensagens_voodoo)
        try:
            await member.send(f"**maldição cibernética ativada:**\n> {msg}")
            await ctx.send(f"mandei a praga pro {member.mention} kkk")
        except:
            await ctx.send("não consegui amaldiçoar esse corno (provavelmente com dm bloqueada)")

    @app_commands.command(name="voodoo", description="manda uma praga digital fake no user marcado")
    async def voodoo_slash(self, interaction: discord.Interaction, member: discord.Member):
        msg = random.choice(self.mensagens_voodoo)
        try:
            await member.send(f"**maldição cibernética ativada:**\n> {msg}")
            await interaction.response.send_message(f"mandei a praga pro {member.mention} kkk", ephemeral=True)
        except:
            await interaction.response.send_message("não consegui amaldiçoar esse corno (dm fechada ou bot sem perm)", ephemeral=True)

async def setup(bot):
    await bot.add_cog(Voodoo(bot))
