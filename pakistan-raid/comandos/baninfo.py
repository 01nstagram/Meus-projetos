import discord
from discord.ext import commands
from discord import app_commands

class BanInfo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="baninfo")
    async def baninfo_prefix(self, ctx, user_id: int):
        ban = await ctx.guild.fetch_ban(discord.Object(id=user_id))
        embed = discord.Embed(title="BanInfo", color=discord.Color.red())
        embed.add_field(name="User", value=ban.user, inline=True)
        embed.add_field(name="Motivo", value=ban.reason or "sem motivo, só raiva", inline=True)
        await ctx.reply(embed=embed)

    @app_commands.command(name="baninfo", description="Mostra se um user tá banido e pq")
    @app_commands.describe(user_id="ID do user banido")
    async def baninfo_slash(self, interaction: discord.Interaction, user_id: str):
        try:
            ban = await interaction.guild.fetch_ban(discord.Object(id=int(user_id)))
            embed = discord.Embed(title="BanInfo", color=discord.Color.red())
            embed.add_field(name="User", value=ban.user, inline=True)
            embed.add_field(name="Motivo", value=ban.reason or "sem motivo, só ódio no coração", inline=True)
            await interaction.response.send_message(embed=embed)
        except:
            await interaction.response.send_message("n achei esse banido n parça", ephemeral=True)

async def setup(bot):
    await bot.add_cog(BanInfo(bot))
