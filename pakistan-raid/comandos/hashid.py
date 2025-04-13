import discord
from discord.ext import commands

class HashID(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="hashid")
    async def hashid(self, ctx, hash_str: str):
        tipos = {
            32: "Possivelmente MD5",
            40: "Possivelmente SHA1",
            64: "Possivelmente SHA256",
            128: "Possivelmente SHA512",
        }

        tipo = tipos.get(len(hash_str), "desconhecido ou fora dos padrões comuns")
        await ctx.reply(f"**Hash:** `{hash_str}`\n**Tipo:** `{tipo}`")

async def setup(bot):
    await bot.add_cog(HashID(bot))
