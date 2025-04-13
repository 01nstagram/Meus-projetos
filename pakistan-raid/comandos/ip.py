import discord
from discord.ext import commands
from discord import app_commands
import requests

class GeoIP(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def get_geo(self, ip):
        try:
            res = requests.get(f"http://ip-api.com/json/{ip}?fields=66846719").json()
            if res["status"] != "success":
                return None
            return res
        except:
            return None

    @commands.command(name="geoip")
    async def geoip_prefix(self, ctx, ip: str):
        await self.send_geo(ctx, ip)

    @app_commands.command(name="geoip", description="Puxa info de um IP")
    @app_commands.describe(ip="o ip pra investigar")
    async def geoip_slash(self, interaction: discord.Interaction, ip: str):
        await interaction.response.defer()
        await self.send_geo(interaction, ip)

    async def send_geo(self, ctx, ip):
        data = await self.get_geo(ip)
        if not data:
            msg = "nao consegui pegar info do ip fi"
            if isinstance(ctx, commands.Context): await ctx.reply(msg)
            else: await ctx.followup.send(msg)
            return

        embed = discord.Embed(title=f"GeoIP - {ip}", color=discord.Color.blurple())
        embed.add_field(name="Org", value=data.get("org", "n sei"), inline=True)
        embed.add_field(name="ISP", value=data.get("isp", "n sei"), inline=True)
        embed.add_field(name="País", value=data.get("country", "n sei"), inline=True)
        embed.add_field(name="Estado", value=data.get("regionName", "n sei"), inline=True)
        embed.add_field(name="Cidade", value=data.get("city", "n sei"), inline=True)
        embed.add_field(name="ASN", value=data.get("as", "n sei"), inline=True)
        embed.add_field(name="Latitude", value=str(data.get("lat", "n sei")), inline=True)
        embed.add_field(name="Longitude", value=str(data.get("lon", "n sei")), inline=True)
        embed.add_field(name="Fuso horário", value=data.get("timezone", "n sei"), inline=False)
        embed.set_footer(text="by pakistan hunters")

        if isinstance(ctx, commands.Context): await ctx.reply(embed=embed)
        else: await ctx.followup.send(embed=embed)
        
async def setup(bot):
    await bot.add_cog(GeoIP(bot))
