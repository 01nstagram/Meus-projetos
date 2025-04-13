from discord.ext import commands
import discord

# ID dos donos permitidos
DONOS = [1326518073615978508, 1288450714862882826]  # coloca teu id aqui parça

class LeaveServer(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="leaveserver")
    async def leaveserver(self, ctx, guild_id: int = None):
        if ctx.author.id not in DONOS:
            return await ctx.send("❌ tu não tem permissão pra isso mlk, sai fora")

        if not guild_id:
            return await ctx.send("❌ manda o ID do server pra eu sair seu bosta")

        guild = self.bot.get_guild(guild_id)
        if not guild:
            return await ctx.send("❌ não to em nenhum server com esse ID seu zé")

        try:
            await guild.leave()
            await ctx.send(f"✅ saí do servidor `{guild.name}` ({guild.id}) com sucesso")
        except Exception as e:
            await ctx.send(f"❌ erro ao tentar sair do server: {e}")

async def setup(bot):
    await bot.add_cog(LeaveServer(bot))
