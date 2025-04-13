import discord
from discord.ext import commands

class HashDecrypt(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="decrypt")
    async def decrypt(self, ctx, hash_input: str):
        wordlist = ["123456", "password", "admin", "pakistan", "hunter", "senha", "qwerty", "abc123"]

        import hashlib

        found = None
        for word in wordlist:
            for algo in ['md5', 'sha1', 'sha256']:
                h = getattr(hashlib, algo)()
                h.update(word.encode())
                if h.hexdigest() == hash_input:
                    found = (word, algo)
                    break
            if found:
                break

        if found:
            await ctx.reply(f"**Hash:** `{hash_input}`\n**Texto original:** `{found[0]}`\n**Algoritmo:** `{found[1]}`")
        else:
            await ctx.reply("n consegui quebrar essa hash fia, manda uma mais fraca ou edita a wordlist")

async def setup(bot):
    await bot.add_cog(HashDecrypt(bot))
