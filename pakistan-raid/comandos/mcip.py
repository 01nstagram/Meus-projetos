import discord
from discord.ext import commands
from discord import app_commands
import dns.resolver
import socket
from mcstatus import JavaServer

class MinecraftIP(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def get_minecraft_ip(self, domain):
        try:
            # tenta SRV
            srv_records = dns.resolver.resolve(f"_minecraft._tcp.{domain}", "SRV")
            target = str(srv_records[0].target).rstrip('.')
            port = srv_records[0].port
        except:
            target = domain
            port = 25565

        try:
            ip = socket.gethostbyname(target)
        except socket.gaierror:
            ip = "não resolvido"

        return ip, port

    def get_server_status(self, ip, port):
        try:
            server = JavaServer(ip, port)
            status = server.status()
            return {
                "online": True,
                "motd": status.description,
                "players": f"{status.players.online}/{status.players.max}",
                "version": status.version.name
            }
        except:
            return {
                "online": False
            }

    @commands.command(name="mcip")
    async def mcip_prefix(self, ctx, domain):
        ip, port = self.get_minecraft_ip(domain)
        status = self.get_server_status(ip, port)

        embed = discord.Embed(
            title="IP do servidor Minecraft",
            description=f"**Domain:** `{domain}`\n**IP:** `{ip}`\n**Porta:** `{port}`",
            color=0x00ff00 if status["online"] else 0xff0000
        )

        if status["online"]:
            embed.add_field(name="Status", value="Online", inline=True)
            embed.add_field(name="Players", value=status["players"], inline=True)
            embed.add_field(name="Versão", value=status["version"], inline=True)
            embed.add_field(name="MOTD", value=status["motd"], inline=False)
        else:
            embed.add_field(name="Status", value="Offline", inline=False)

        await ctx.reply(embed=embed)

    @app_commands.command(name="mcip", description="Puxa IP, porta e status de um server Minecraft")
    @app_commands.describe(domain="domínio do servidor")
    async def mcip_slash(self, interaction: discord.Interaction, domain: str):
        ip, port = self.get_minecraft_ip(domain)
        status = self.get_server_status(ip, port)

        embed = discord.Embed(
            title="IP do servidor Minecraft",
            description=f"**Domain:** `{domain}`\n**IP:** `{ip}`\n**Porta:** `{port}`",
            color=0x00ff00 if status["online"] else 0xff0000
        )

        if status["online"]:
            embed.add_field(name="Status", value="Online", inline=True)
            embed.add_field(name="Players", value=status["players"], inline=True)
            embed.add_field(name="Versão", value=status["version"], inline=True)
            embed.add_field(name="MOTD", value=status["motd"], inline=False)
        else:
            embed.add_field(name="Status", value="Offline", inline=False)

        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(MinecraftIP(bot))
