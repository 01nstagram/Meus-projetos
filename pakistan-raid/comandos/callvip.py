import discord
from discord.ext import commands
from discord import app_commands
import asyncio

# ID do cargo que PODE usar o comando (altere isso)
CARGO_PERMITIDO_ID = 1360525626460868770

class CallVIP(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def criar_callvip(self, ctx, nome_call):
        guild = ctx.guild
        autor = ctx.author

        cargo_permitido = discord.utils.get(guild.roles, id=CARGO_PERMITIDO_ID)
        if cargo_permitido not in autor.roles:
            msg = "tu não tem permissão pra usar esse comando seu desgraçadinho"
            if isinstance(ctx, commands.Context):
                return await ctx.reply(msg)
            else:
                return await ctx.response.send_message(msg, ephemeral=True)

        nome_formatado = f"VIP - {nome_call}"
        # cria o cargo
        novo_cargo = await guild.create_role(name=nome_formatado)
        
        # dá o cargo pro autor
        await autor.add_roles(novo_cargo)

        # cria a call com permissão só pro cargo
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(connect=False),
            novo_cargo: discord.PermissionOverwrite(connect=True, view_channel=True),
            guild.me: discord.PermissionOverwrite(connect=True, view_channel=True),
        }

        categoria = discord.utils.get(guild.categories, name="Calls VIP")
        if not categoria:
            categoria = await guild.create_category("Calls VIP")

        call = await guild.create_voice_channel(nome_formatado, overwrites=overwrites, category=categoria)

        msg = f"✅ call vip **{nome_formatado}** criada com sucesso\ncargo criado: {novo_cargo.mention}"
        if isinstance(ctx, commands.Context):
            await ctx.reply(msg)
        else:
            await ctx.response.send_message(msg)

    @commands.command(name="callvip")
    async def callvip_prefix(self, ctx, *, nome_call: str):
        await self.criar_callvip(ctx, nome_call)

    @app_commands.command(name="callvip", description="cria uma call vip com cargo exclusivo")
    @app_commands.describe(nome_call="nome da call vip")
    async def callvip_slash(self, interaction: discord.Interaction, nome_call: str):
        await self.criar_callvip(interaction, nome_call)

async def setup(bot):
    await bot.add_cog(CallVIP(bot))
