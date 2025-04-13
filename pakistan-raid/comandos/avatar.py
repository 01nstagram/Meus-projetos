import discord
from discord.ext import commands
from discord import app_commands
from datetime import datetime

class Avatar(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='avatar', help='Mostra o avatar de um membro')
    async def avatar_prefix(self, ctx: commands.Context, member: discord.Member = None):
        member = member or ctx.author
        await self.send_avatar_embed(ctx, member, is_interaction=False)

    @app_commands.command(name='avatar', description='Mostra o avatar de um membro')
    async def avatar_slash(self, interaction: discord.Interaction, member: discord.Member = None):
        member = member or interaction.user
        await self.send_avatar_embed(interaction, member, is_interaction=True)

    async def send_avatar_embed(self, origem, member, is_interaction: bool):
        avatar_url = member.display_avatar.url
        embed = discord.Embed(
            title=f"Avatar de {member.display_name}",
            description=f"[Clique aqui para abrir o avatar em tamanho real]({avatar_url})",
            color=discord.Color.blurple(),
            timestamp=datetime.utcnow()
        )
        if is_interaction:
            embed.set_author(name=str(origem.user), icon_url=origem.user.display_avatar.url)
            embed.set_footer(text=f"Comando solicitado por {origem.user.display_name}", icon_url=origem.user.display_avatar.url)
        else:
            embed.set_author(name=str(origem.author), icon_url=origem.author.display_avatar.url)
            embed.set_footer(text=f"Comando solicitado por {origem.author.display_name}", icon_url=origem.author.display_avatar.url)

        embed.set_thumbnail(url=member.display_avatar.url)
        embed.set_image(url=avatar_url)
        embed.add_field(name="ID do Usuário", value=f"```{member.id}```", inline=True)
        embed.add_field(name="Nome", value=f"```{member.display_name}```", inline=True)
        embed.add_field(name="Conta criada em", value=member.created_at.strftime("%d/%m/%Y %H:%M:%S"), inline=True)

        if is_interaction:
            await origem.response.send_message(embed=embed)
        else:
            await origem.reply(embed=embed)

async def setup(bot):
    await bot.add_cog(Avatar(bot))
