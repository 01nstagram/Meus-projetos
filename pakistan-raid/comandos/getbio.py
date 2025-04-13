import discord
from discord.ext import commands
from discord import app_commands

class GetBio(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="getbio")
    async def getbio_prefix(self, ctx, member: discord.Member = None):
        member = member or ctx.author
        bio = (await self.bot.fetch_user(member.id)).bio
        await ctx.reply(embed=discord.Embed(title=f"Bio do {member}", description=bio or "n tem bio nem vida", color=discord.Color.purple()))

    @app_commands.command(name="getbio", description="Puxa a bio de um user")
    @app_commands.describe(user="Usuário pra ver a bio")
    async def getbio_slash(self, interaction: discord.Interaction, user: discord.Member):
        bio = (await self.bot.fetch_user(user.id)).bio
        embed = discord.Embed(title=f"Bio do {user}", description=bio or "n tem bio nem vida", color=discord.Color.purple())
        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(GetBio(bot))
