import discord
from discord.ext import commands
from discord import app_commands

class Molestar(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="molestar")
    async def molestar_prefix(self, ctx, member: discord.Member = None):
        if not member:
            return await ctx.reply("marca alguém pra molestar fi")
        await ctx.reply(f"{member.mention} foi **molestado com sucesso** por {ctx.author.mention} kkkkk")

    @app_commands.command(name="molestar", description="Molesta um usuário aleatoriamente kkk")
    @app_commands.describe(member="quem vai ser molestado")
    async def molestar_slash(self, interaction: discord.Interaction, member: discord.Member):
        await interaction.response.send_message(f"{member.mention} foi **molestado com sucesso** por {interaction.user.mention} kkkkk", ephemeral=False)

async def setup(bot):
    await bot.add_cog(Molestar(bot))
