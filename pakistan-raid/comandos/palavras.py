import discord
from discord.ext import commands
import json
import os

caminho = "Config/palavras.json"

def carregar_palavras():
    if not os.path.exists(caminho):
        with open(caminho, "w") as f:
            json.dump({}, f)
    with open(caminho, "r") as f:
        return json.load(f)

def salvar_palavras(data):
    with open(caminho, "w") as f:
        json.dump(data, f, indent=4)

class PalavraBlock(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.palavras = carregar_palavras()

    def get_palavras(self, guild_id):
        return self.palavras.get(str(guild_id), [])

    def add_palavra(self, guild_id, palavra):
        guild_id = str(guild_id)
        if guild_id not in self.palavras:
            self.palavras[guild_id] = []
        self.palavras[guild_id].append(palavra.lower())
        salvar_palavras(self.palavras)

    def remove_palavra(self, guild_id, palavra):
        guild_id = str(guild_id)
        if guild_id in self.palavras and palavra.lower() in self.palavras[guild_id]:
            self.palavras[guild_id].remove(palavra.lower())
            salvar_palavras(self.palavras)

    @commands.command(name="addpalavra")
    async def addpalavra(self, ctx, *, palavra: str):
        self.add_palavra(ctx.guild.id, palavra)
        await ctx.send(f"palavra **{palavra}** foi adicionada a blacklist")

    @commands.command(name="removepalavra")
    async def removepalavra(self, ctx, *, palavra: str):
        self.remove_palavra(ctx.guild.id, palavra)
        await ctx.send(f"palavra **{palavra}** foi removida da blacklist")

    @commands.command(name="listapalavras")
    async def listapalavras(self, ctx):
        palavras = self.get_palavras(ctx.guild.id)
        if not palavras:
            await ctx.send("não tem nenhuma palavra bloqueada ainda")
        else:
            await ctx.send("palavras bloqueadas:\n" + "\n".join(palavras))

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot or not message.guild:
            return
        palavras = self.get_palavras(message.guild.id)
        if any(p in message.content.lower() for p in palavras):
            await message.delete()
            await message.channel.send(f"{message.author.mention} cuidado com as palavras **proibida**")

    @commands.Cog.listener()
    async def on_message_edit(self, before, after):
        if after.author.bot or not after.guild:
            return
        palavras = self.get_palavras(after.guild.id)
        if any(p in after.content.lower() for p in palavras):
            await after.delete()
            await after.channel.send(f"{after.author.mention} cuidado com as palavras **proibida** (editando msg kkkkk)")

async def setup(bot):
    await bot.add_cog(PalavraBlock(bot))
