import discord
from discord.ext import commands

class DmAll(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="dm", help="manda uma msg na dm de todo mundo do server, modo fantasma")
    async def dm(self, ctx, *, texto: str):
        if not ctx.author.guild_permissions.administrator:
            return await ctx.send("tu n é adm fi, se toca")

        await ctx.send("enviando nas dm dos cria... segura")

        membros = ctx.guild.members
        enviados = 0
        falha = 0

        for membro in membros:
            if membro.bot: continue
            try:
                await membro.send(texto)
                enviados += 1
            except:
                falha += 1

        await ctx.send(f"**enviei msg pra {enviados} usuários** | {falha} falhou pq tão fechado ou são bait")

async def setup(bot):
    await bot.add_cog(DmAll(bot))
