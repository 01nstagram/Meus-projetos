import discord
from discord.ext import commands
from discord import app_commands

class SetCargoVIP(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def setar_cargo_vip(self, ctx, cargo: discord.Role, membro: discord.Member):
        try:
            await membro.add_roles(cargo)
            msg = f"✅ o cargo {cargo.mention} foi adicionado pro {membro.mention}"
        except Exception as e:
            msg = f"deu ruim pra setar o cargo: `{str(e)}`"

        if isinstance(ctx, commands.Context):
            await ctx.reply(msg)
        else:
            await ctx.response.send_message(msg)

    @commands.command(name="setcargovip")
    async def setcargovip_prefix(self, ctx, cargo: discord.Role, membro: discord.Member):
        await self.setar_cargo_vip(ctx, cargo, membro)

    @app_commands.command(name="setcargovip", description="seta o cargo vip em alguém")
    @app_commands.describe(cargo="cargo que será dado", membro="membro que vai receber")
    async def setcargovip_slash(self, interaction: discord.Interaction, cargo: discord.Role, membro: discord.Member):
        await self.setar_cargo_vip(interaction, cargo, membro)

async def setup(bot):
    await bot.add_cog(SetCargoVIP(bot))
