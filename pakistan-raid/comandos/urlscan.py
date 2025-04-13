import discord
from discord.ext import commands
from discord import app_commands
import socket
import re
import aiohttp
import nmap

class Scanner(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def scan_site(self, url):
        results = {}

        try:
            if not url.startswith("http"):
                url = "http://" + url

            domain = re.findall(r"https?://([^/]+)", url)[0]
            ip = socket.gethostbyname(domain)
            results['ip'] = ip

            # NMAP - scan portas
            nm = nmap.PortScanner()
            nm.scan(ip, arguments="-T4 -F")
            portas = []
            for proto in nm[ip].all_protocols():
                for port in nm[ip][proto].keys():
                    portas.append(f"{port}/{proto}")
            results['ports'] = portas

            async with aiohttp.ClientSession() as session:
                async with session.get(url) as r:
                    html = await r.text()

                    # Admin panel
                    if "admin" in html.lower():
                        results['admin'] = True

                    # WordPress
                    if re.search(r"/wp-(content|admin|includes)/", html):
                        results['wordpress'] = True
                        wp_version = re.findall(r"ver=(\d+\.\d+(\.\d+)*)", html)
                        if wp_version:
                            results['wp_version'] = wp_version[0][0]

                    falhas = []

                    # SQLi
                    if re.search(r"sql syntax|mysql_fetch|sql error|PDOException", html, re.I):
                        falhas.append("SQL Injection")

                    # XSS
                    if re.search(r"<script>.*</script>", html, re.I):
                        falhas.append("XSS (Cross-site Scripting)")

                    # LFI / RFI
                    if re.search(r"(etc/passwd|boot.ini|proc/self/environ)", html, re.I):
                        falhas.append("LFI / RFI")

                    # Path Traversal
                    if re.search(r"\.\./\.\./", html):
                        falhas.append("Path Traversal")

                    # Upload vulnerability
                    if re.search(r"upload", html.lower()) and re.search(r".php", html.lower()):
                        falhas.append("Possível File Upload vulnerability")

                    # Apache info leak
                    if "apache" in html.lower() or "php/" in html.lower():
                        falhas.append("Server Info Leak (Apache/PHP)")

                    # Open Redirect
                    if re.search(r"(?i)(redirect|redir|url)=http", html):
                        falhas.append("Possível Open Redirect")

                    # .git ou robots
                    try:
                        async with session.get(url + "/.git/config") as git_r:
                            if git_r.status == 200:
                                falhas.append(".git exposto")

                        async with session.get(url + "/robots.txt") as robots:
                            if robots.status == 200:
                                falhas.append("robots.txt acessível")
                    except:
                        pass

                    results['falhas'] = falhas

        except Exception as e:
            results['erro'] = str(e)

        return results

    @commands.command(name="scan")
    async def scan_prefix(self, ctx, url: str):
        await self.do_scan(ctx, url)

    @app_commands.command(name="scan", description="Scaneia URL e detecta falhas, portas, IP, admin e Wordpress")
    @app_commands.describe(url="URL do site pra scanear")
    async def scan_slash(self, interaction: discord.Interaction, url: str):
        await interaction.response.defer()
        await self.do_scan(interaction, url)

    async def do_scan(self, ctx, url):
        embed = discord.Embed(title="Scanner Pakistan Hunters", color=discord.Color.red())
        embed.add_field(name="URL", value=url, inline=False)

        resultado = await self.scan_site(url)

        if 'erro' in resultado:
            embed.description = f"Erro ao escanear: `{resultado['erro']}`"
        else:
            embed.add_field(name="IP", value=resultado.get('ip', 'não encontrado'), inline=False)
            embed.add_field(name="Portas abertas", value=', '.join(resultado.get('ports', [])) or "nada encontrado", inline=False)

            if resultado.get('admin'):
                embed.add_field(name="Painel Admin", value="**Possivelmente encontrado**", inline=True)
            if resultado.get('wordpress'):
                embed.add_field(name="WordPress", value=f"Sim (v{resultado.get('wp_version', '?')})", inline=True)

            if resultado.get('falhas'):
                embed.add_field(name="Possíveis Falhas", value='\n'.join(resultado['falhas']), inline=False)

        embed.set_footer(text="by pakistan hunters")

        if isinstance(ctx, commands.Context):
            await ctx.reply(embed=embed)
        else:
            await ctx.followup.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Scanner(bot))
