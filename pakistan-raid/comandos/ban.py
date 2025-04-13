import discord
from discord.ext import commands
from discord import app_commands, ui

class ConfirmBan(discord.ui.View):
    def __init__(self, ctx, user, motivo):
        super().__init__(timeout=15)
        self.ctx = ctx
        self.user = user
        self.motivo = motivo
        self.resultado = None

    @discord.ui.button(label="Confirmar Ban", style=discord.ButtonStyle.danger)
    async def confirmar(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user != self.ctx.author:
            return await interaction.response.send_message("fi, esse botão nem é pra tu", ephemeral=True)

        try:
            await self.ctx.guild.ban(self.user, reason=self.motivo)
            await interaction.message.delete()
            await self.ctx.send(embed=discord.Embed(
                title="BAN FEITO",
                description=f"**{self.user}** foi banido com sucesso pelo {self.ctx.author.mention}\n**Motivo:** {self.motivo}",
                color=discord.Color.red()
            ))
        except Exception as e:
            await interaction.message.delete()
            await self.ctx.send(f"não consegui banir o fiote: `{e}`")

class Ban(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="ban", help="ban um maluco com botão de confirmação")
    async def ban_prefix(self, ctx, member: discord.Member, *, motivo: str = "sem motivo"):
        if not ctx.author.guild_permissions.ban_members:
            return await ctx.send("tu n tem perm pra banir fiote")

        embed = discord.Embed(
            title="confirmação de ban",
            description=f"deseja banir o {member.mention}?\n**Motivo:** {motivo}",
            color=discord.Color.orange()
        )
        await ctx.send(embed=embed, view=ConfirmBan(ctx, member, motivo))

    @app_commands.command(name="ban", description="ban um usuário com botão de confirmação")
    @app_commands.describe(usuario="quem tu quer banir", motivo="motivo do ban")
    async def ban_slash(self, interaction: discord.Interaction, usuario: discord.Member, motivo: str = "sem motivo"):
        if not interaction.user.guild_permissions.ban_members:
            return await interaction.response.send_message("sem perm pra ban fi", ephemeral=True)

        embed = discord.Embed(
            title="confirmação de ban",
            description=f"deseja banir o {usuario.mention}?\n**Motivo:** {motivo}",
            color=discord.Color.orange()
        )

        view = ConfirmBan(interaction, usuario, motivo)
        fakectx = await self.bot.get_context(interaction)  # cria um ctx fake pra usar o mesmo código
        view.ctx = fakectx
        await interaction.response.send_message(embed=embed, view=view)

async def setup(bot):
    await bot.add_cog(Ban(bot))
