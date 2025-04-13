import discord
from discord.ext import commands
from discord import app_commands

class Invite(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # SlashCommand
    @app_commands.command(name="invite", description="Gera um convite personalizado para o servidor")
    async def slash_invite(self, interaction: discord.Interaction):
        await self._send_invite(interaction)

    # PrefixCommand
    @commands.command(name="invite", help="Gera um convite personalizado para o servidor")
    async def prefix_invite(self, ctx):
        await self._send_invite(ctx)

    async def _send_invite(self, ctx_or_interaction):
        is_interaction = isinstance(ctx_or_interaction, discord.Interaction)

        try:
            bot_invite_url = f"https://discord.com/oauth2/authorize?client_id={self.bot.user.id}&permissions=8&integration_type=0&scope=bot"

            if is_interaction:
                channel = ctx_or_interaction.channel
            else:
                channel = ctx_or_interaction.channel

            invite = await channel.create_invite(max_uses=0, max_age=0, unique=True)

            embed = discord.Embed(
                title="Convite Personalizado",
                description=f"Olá {ctx_or_interaction.user.mention if is_interaction else ctx_or_interaction.author.mention}, aqui está o seu convite para este servidor!",
                color=discord.Color.blurple()
            )
            embed.add_field(name="Link do Convite:", value=invite.url)
            embed.add_field(name="Adicione o Bot ao seu Servidor", value=bot_invite_url, inline=False)

            if is_interaction:
                await ctx_or_interaction.response.send_message(embed=embed)
            else:
                await ctx_or_interaction.reply(embed=embed)

        except discord.Forbidden:
            error_embed = discord.Embed(
                title="Erro ao Gerar Convite",
                description="Não tenho permissão para criar convites neste canal.",
                color=discord.Color.red()
            )
            if is_interaction:
                await ctx_or_interaction.response.send_message(embed=error_embed, ephemeral=True)
            else:
                await ctx_or_interaction.reply(embed=error_embed)

        except Exception as e:
            error_embed = discord.Embed(
                title="Erro ao Gerar Convite",
                description=f"Ocorreu um erro ao tentar gerar o convite: `{e}`",
                color=discord.Color.red()
            )
            if is_interaction:
                await ctx_or_interaction.response.send_message(embed=error_embed, ephemeral=True)
            else:
                await ctx_or_interaction.reply(embed=error_embed)

async def setup(bot):
    await bot.add_cog(Invite(bot))
