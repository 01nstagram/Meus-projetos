import discord
from discord.ext import commands
from discord import app_commands

class UnlockCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # Comando com Prefixo - Unlock
    @commands.command(name="unlock")
    @commands.has_permissions(manage_channels=True)
    async def unlock(self, ctx: commands.Context):
        """Habilita a escrita no canal (com prefixo)."""
        channel = ctx.channel
        await channel.set_permissions(ctx.guild.default_role, send_messages=True)
        await ctx.send(f"🔓 Canal `{channel.name}` desbloqueado!")

    # Comando com Slash - Unlock
    @app_commands.command(name="unlock", description="Habilita a escrita no canal")
    async def slash_unlock(self, interaction: discord.Interaction):
        """Habilita a escrita no canal (com SlashCommand)."""
        # Verifica se o usuário tem permissão para gerenciar canais
        if not interaction.user.guild_permissions.manage_channels:
            await interaction.response.send_message("Você não tem permissão para gerenciar canais!", ephemeral=True)
            return

        channel = interaction.channel
        await channel.set_permissions(interaction.guild.default_role, send_messages=True)
        await interaction.response.send_message(f"🔓 Canal `{channel.name}` desbloqueado!")

# Configura o Cog
async def setup(bot):
    await bot.add_cog(UnlockCog(bot))
