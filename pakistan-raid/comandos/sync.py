import discord
from discord.ext import commands
from discord import app_commands

class Sync(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # SlashCommand
    @app_commands.command(name="sync", description="Sincroniza os comandos do bot com o Discord.")
    @app_commands.checks.has_permissions(administrator=True)
    async def slash_sync(self, interaction: discord.Interaction):
        await self._sync_commands(interaction)

    # PrefixCommand
    @commands.command(name="sync", help="Sincroniza os comandos do bot com o Discord.")
    @commands.has_permissions(administrator=True)
    async def prefix_sync(self, ctx):
        await self._sync_commands(ctx)

    async def _sync_commands(self, ctx_or_interaction):
        is_interaction = isinstance(ctx_or_interaction, discord.Interaction)
        try:
            # sync global
            global_commands = await self.bot.tree.sync()

            # sync só no servidor (guild) atual
            if is_interaction:
                local_commands = await self.bot.tree.sync(guild=ctx_or_interaction.guild)
            else:
                local_commands = await self.bot.tree.sync(guild=ctx_or_interaction.guild)

            embed = discord.Embed(
                title="Comandos sincronizados!",
                description=(
                    f"**Global:** `{len(global_commands)}` comandos.\n"
                    f"**Servidor:** `{len(local_commands)}` comandos."
                ),
                color=discord.Color.green()
            )

            if is_interaction:
                await ctx_or_interaction.response.send_message(embed=embed, ephemeral=True)
            else:
                await ctx_or_interaction.reply(embed=embed)

        except Exception as e:
            embed = discord.Embed(
                title="Erro ao sincronizar",
                description=f"Erro: `{str(e)}`",
                color=discord.Color.red()
            )
            if is_interaction:
                await ctx_or_interaction.response.send_message(embed=embed, ephemeral=True)
            else:
                await ctx_or_interaction.reply(embed=embed)

async def setup(bot):
    await bot.add_cog(Sync(bot))
