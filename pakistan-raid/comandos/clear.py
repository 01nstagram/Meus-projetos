import discord
from discord import app_commands
from discord.ext import commands

class Clear(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # SLASH COMMAND
    @app_commands.command(name="clear", description="limpa as msg do canal no grau até 1000")
    @app_commands.describe(quantidade="quantidade de msg pra limpar (máx 1000)")
    async def clear_slash(self, interaction: discord.Interaction, quantidade: int):
        if not interaction.channel.permissions_for(interaction.user).manage_messages:
            return await interaction.response.send_message("tu n tem perm pra isso fi", ephemeral=True)

        if quantidade > 1000:
            return await interaction.response.send_message("no máximo 1000 fi, não força", ephemeral=True)

        await interaction.response.defer(ephemeral=True)
        deletadas = await interaction.channel.purge(limit=quantidade)
        await interaction.followup.send(f"limpei {len(deletadas)} msg fi, estilo pakistan", ephemeral=True)

    # PREFIXO
    @commands.command(name="clear", aliases=["limpar", "apagar"])
    async def clear_prefix(self, ctx, quantidade: int):
        if not ctx.channel.permissions_for(ctx.author).manage_messages:
            return await ctx.send("tu n tem perm pra isso fi")

        if quantidade > 1000:
            return await ctx.send("no máximo 1000 fi, para de forçar")

        deletadas = await ctx.channel.purge(limit=quantidade + 1)
        confirm = await ctx.send(f"limpei {len(deletadas)-1} msg fi, no talento")
        await confirm.delete(delay=3)

async def setup(bot):
    await bot.add_cog(Clear(bot))
