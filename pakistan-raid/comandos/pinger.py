import discord
from discord.ext import commands, tasks
import aiohttp
import asyncio

class PingerPrefix(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.sites_monitorados = {}

    @commands.command(name="pinger")
    async def pinger(self, ctx, url: str):
        if url in self.sites_monitorados:
            await ctx.send(f"já tô monitorando {url}, calma carai")
            return

        self.sites_monitorados[url] = {"status": None, "channel": ctx.channel}
        await ctx.send(f"vou monitorar {url} agr pae, se cair eu aviso")

        async def monitorar():
            while url in self.sites_monitorados:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(url, timeout=5) as resp:
                            status_code = resp.status
                    status = "online" if status_code < 500 else "offline"
                except:
                    status = "offline"

                last_status = self.sites_monitorados[url]["status"]
                if last_status != status:
                    self.sites_monitorados[url]["status"] = status
                    await ctx.channel.send(f"{url} tá **{status}** agora mlk")

                await asyncio.sleep(15)

        self.bot.loop.create_task(monitorar())

    @commands.command(name="pararpinger")
    async def parar_pinger(self, ctx, url: str):
        if url in self.sites_monitorados:
            del self.sites_monitorados[url]
            await ctx.send(f"parei de monitorar {url} pae")
        else:
            await ctx.send(f"eu nem tava monitorando isso fi")

async def setup(bot):
    await bot.add_cog(PingerPrefix(bot))
