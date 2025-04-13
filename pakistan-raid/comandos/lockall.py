import discord
from discord.ext import commands
from discord import app_commands

class LockAll(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def lock_category(self, interaction_or_ctx, category):
        for channel in category.channels:
            if isinstance(channel, discord.TextChannel):
                overwrite = channel.overwrites_for(category.guild.default_role)
                overwrite.send_messages = False
                await channel.set_permissions(category.guild.default_role, overwrite=overwrite)

        embed = discord.Embed(
            title="Canais bloqueados",
            description=f"Todos os canais da categoria **{category.name}** foram travados.",
            color=discord.Color.red()
        )
        embed.set_footer(text="by pakistan hunters")

        if isinstance(interaction_or_ctx, discord.Interaction):
            await interaction_or_ctx.followup.send(embed=embed)
        else:
            await interaction_or_ctx.reply(embed=embed)

    @commands.command(name="lockall")
    async def lockall_prefix(self, ctx, *, categoria: discord.CategoryChannel):
        await self.lock_category(ctx, categoria)

    @app_commands.command(name="lockall", description="Trava todos os canais de uma categoria")
    @app_commands.describe(categoria="Categoria pra bloquear")
    async def lockall_slash(self, interaction: discord.Interaction, categoria: discord.CategoryChannel):
        await interaction.response.defer()
        await self.lock_category(interaction, categoria)

async def setup(bot):
    await bot.add_cog(LockAll(bot))
