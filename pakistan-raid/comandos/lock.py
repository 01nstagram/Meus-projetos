import discord
from discord.ext import commands
from discord import app_commands

class LockCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # Comando com Prefixo - Lock
    @commands.command(name="lock")
    @commands.has_permissions(manage_channels=True)
    async def lock(self, ctx: commands.Context):
        """Desabilita a escrita no canal (com prefixo)."""
        channel = ctx.channel
        await channel.set_permissions(ctx.guild.default_role, send_messages=False)
        await ctx.send(f"🔒 Canal `{channel.name}` bloqueado!")

    # Comando com Slash - Lock
    @app_commands.command(name="lock", description="Desabilita a escrita no canal")
    async def slash_lock(self, interaction: discord.Interaction):
        """Desabilita a escrita no canal (com SlashCommand)."""
        # Verifica se o usuário tem permissão para gerenciar canais
        if not interaction.user.guild_permissions.manage_channels:
            await interaction.response.send_message("Você não tem permissão para gerenciar canais!", ephemeral=True)
            return

        channel = interaction.channel
        await channel.set_permissions(interaction.guild.default_role, send_messages=False)
        await interaction.response.send_message(f"🔒 Canal `{channel.name}` bloqueado!")

# Configura o Cog
async def setup(bot):
    await bot.add_cog(LockCog(bot))
