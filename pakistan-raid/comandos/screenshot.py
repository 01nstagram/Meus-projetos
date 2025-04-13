import discord
from discord.ext import commands
from discord import app_commands
import requests
from io import BytesIO

class Screenshot(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="screenshot")
    async def screenshot_prefix(self, ctx, url: str):
        await self.send_screenshot(ctx, url)

    @app_commands.command(name="screenshot", description="tira print de um site")
    @app_commands.describe(url="link do site")
    async def screenshot_slash(self, interaction: discord.Interaction, url: str):
        await interaction.response.defer()
        await self.send_screenshot(interaction, url, slash=True)

    async def send_screenshot(self, ctx, url, slash=False):
        try:
            api = f"https://image.thum.io/get/full/{url}"
            response = requests.get(api)
            if response.status_code != 200:
                raise Exception("não deu pra tirar print do site")

            img_bytes = BytesIO(response.content)
            img_bytes.seek(0)
            file = discord.File(img_bytes, filename="screenshot.png")

            embed = discord.Embed(
                title="aí o print do site krl",
                description=f"[clicar pra ir pro site]({url})",
                color=discord.Color.red()
            )
            embed.set_image(url="attachment://screenshot.png")

            if slash:
                await ctx.followup.send(embed=embed, file=file)
            else:
                await ctx.send(embed=embed, file=file)

        except Exception as e:
            err_msg = f"deu ruim na printagem: `{str(e)}`"
            if slash:
                await ctx.followup.send(err_msg)
            else:
                await ctx.send(err_msg)

async def setup(bot):
    await bot.add_cog(Screenshot(bot))
