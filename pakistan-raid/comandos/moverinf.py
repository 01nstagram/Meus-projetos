import discord
from discord.ext import commands
import random

class MoverInf(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def mov_inf(self, ctx, quantidade: int, membro: discord.Member):
        if not ctx.author.guild_permissions.administrator:
            await ctx.send("vaza meu cria cria")
            return

        if not membro.voice or not membro.voice.channel:
            await ctx.send("poha mano quer mover o mlk sem estar no canal e de fuder")
            return

        canais = [canal for canal in ctx.guild.voice_channels if canal != membro.voice.channel]

        if len(canais) < 1:
            await ctx.send("tem poucos canais mano")
            return

        for _ in range(quantidade):
            if canais:  # Verifica se a lista de canais não está vazia
                canal_destino = random.choice(canais)
                await membro.move_to(canal_destino)
            else:
                await ctx.send("Nenhum canal disponível para mover o membro.")
                break

        await ctx.send(f"O mano {membro.mention} foi movido {quantidade} vezes")

# A função setup agora é uma coroutine, com 'await'
async def setup(bot):
    await bot.add_cog(MoverInf(bot))
