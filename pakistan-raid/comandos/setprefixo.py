import discord
from discord.ext import commands

# Função para salvar o novo prefixo no arquivo JSON
def salvar_prefixo(guild_id, prefixo):
    prefixos = carregar_prefixos()
    prefixos[str(guild_id)] = prefixo
    with open("prefixos.json", "w") as f:
        json.dump(prefixos, f, indent=4)

class Prefixo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="setprefixo")
    @commands.has_permissions(administrator=True)
    async def setprefixo(self, ctx, novo_prefixo: str):
        guild_id = ctx.guild.id
        salvar_prefixo(guild_id, novo_prefixo)  # Salva o novo prefixo no arquivo JSON

        # Envia mensagem confirmando a alteração
        await ctx.send(f"Prefixo atualizado para `{novo_prefixo}` neste servidor!")

    @setprefixo.error
    async def setprefixo_error(self, ctx, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("Você não tem permissão para fazer isso!")
        else:
            await ctx.send(f"Erro: {error}")

# Função de setup para carregar a extensão
async def setup(bot):
    await bot.add_cog(Prefixo(bot))
