import discord
from discord.ext import commands
import hashlib

class HashEncrypt(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="encrypt")
    async def encrypt(self, ctx, algoritmo: str, *, texto: str):
        try:
            hash_obj = getattr(hashlib, algoritmo.lower())()
            hash_obj.update(texto.encode())
            resultado = hash_obj.hexdigest()
            await ctx.reply(f"**Texto:** `{texto}`\n**Hash ({algoritmo}):** `{resultado}`")
        except AttributeError:
            await ctx.reply("mano esse algoritmo aí nem existe, usa tipo `md5`, `sha1`, `sha256` etc")

async def setup(bot):
    await bot.add_cog(HashEncrypt(bot))
