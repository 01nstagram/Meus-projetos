import discord
from discord.ext import commands

# ID do dono que pode usar o comando
DONOS = [1326518073615978508, 1356668917648719962]

class ListServer(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="listserver")
    async def listserver(self, ctx):
        if ctx.author.id not in DONOS:
            return await ctx.send("❌ só o brabo pode usar isso mlk")

        embed = discord.Embed(
            title=f"🧠 lista de servidores ({len(self.bot.guilds)})",
            color=discord.Color.blue()
        )

        for guild in self.bot.guilds:
            try:
                invite = None
                for channel in guild.text_channels:
                    if channel.permissions_for(guild.me).create_instant_invite:
                        invite = await channel.create_invite(max_age=3600, max_uses=1, reason="comando -listserver")
                        break
                invite_url = invite.url if invite else "❌ invite não disponível"
            except Exception as e:
                invite_url = f"erro: {e}"

            embed.add_field(
                name=guild.name,
                value=f"""
                👑 Dono: {guild.owner} (`{guild.owner_id}`)
                👥 Membros: {guild.member_count}
                🔗 Invite: {invite_url}
                🆔 ID: `{guild.id}`
                """,
                inline=False
            )

        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(ListServer(bot))
