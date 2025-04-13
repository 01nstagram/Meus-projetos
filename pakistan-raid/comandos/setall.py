import discord
from discord.ext import commands
from discord import app_commands

class SetAll(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # PREFIXO
    @commands.command(name="setall")
    @commands.has_permissions(manage_roles=True)
    async def setall_prefix(self, ctx, cargo: discord.Role):
        await ctx.send("setando o cargo pra geral... segura aí kkkkk")
        count = 0
        for membro in ctx.guild.members:
            if not membro.bot and cargo not in membro.roles:
                try:
                    await membro.add_roles(cargo)
                    count += 1
                except:
                    pass
        await ctx.send(f"cargo `{cargo.name}` setado pra `{count}` membros")

    # SLASHCOMMAND
    @app_commands.command(name="setall", description="seta 1 cargo pra todos do servidor")
    @app_commands.describe(cargo="cargo que vai ser setado pra geral")
    async def setall_slash(self, interaction: discord.Interaction, cargo: discord.Role):
        await interaction.response.send_message("setando o cargo pra geral... segura aí kkkkk", ephemeral=True)
        count = 0
        for membro in interaction.guild.members:
            if not membro.bot and cargo not in membro.roles:
                try:
                    await membro.add_roles(cargo)
                    count += 1
                except:
                    pass
        await interaction.followup.send(f"cargo `{cargo.name}` setado pra `{count}` membros", ephemeral=True)

async def setup(bot):
    await bot.add_cog(SetAll(bot))
