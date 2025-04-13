import discord
from discord.ext import commands
import aiohttp

class UserInfo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="userinfo")
    async def userinfo(self, ctx, user: discord.User = None):
        user = user or ctx.author  # se n marcar ngm, puxa o próprio

        banner_url = None
        bio = "n tem porra nenhuma"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"https://discord.com/api/v10/users/{user.id}",
                headers={"Authorization": f"Bot {self.bot.http.token}"}
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    banner_hash = data.get("banner")
                    bio = data.get("bio", "n tem porra nenhuma")
                    if banner_hash:
                        banner_url = f"https://cdn.discordapp.com/banners/{user.id}/{banner_hash}.{'gif' if banner_hash.startswith('a_') else 'png'}?size=512"

        embed = discord.Embed(
            title=f"userinfo do mlk {user.name}",
            description=f"**bio:** {bio}",
            color=discord.Color.blurple()
        )
        embed.set_thumbnail(url=user.avatar.url if user.avatar else user.default_avatar.url)
        embed.add_field(name="ID", value=f"`{user.id}`", inline=True)
        embed.add_field(name="criado em", value=discord.utils.format_dt(user.created_at, style='F'), inline=True)
        embed.add_field(name="é bot?", value="sim" if user.bot else "n", inline=True)
        embed.set_footer(text="puxado by pakistan hunters")
        if banner_url:
            embed.set_image(url=banner_url)

        await ctx.send(embed=embed)

# adiciona o cog
async def setup(bot):
    await bot.add_cog(UserInfo(bot))
