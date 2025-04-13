import discord
from discord.ext import commands
import random

class CreepypastaDM(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

        self.pastas = [
            {
                "titulo": "Slender Man",
                "desc": "um homi magrelo com tentáculo q fica no mato... se olhar pra ele já era fi",
                "img_url": "https://i.ibb.co/0JmGJtM/slender.jpg"
            },
            {
                "titulo": "Jeff the Killer",
                "desc": "ele só quer q tu 'go to sleep' e te manda pro inferno com um sorrisão sinistro",
                "img_url": "https://i.ibb.co/Y2mdxPP/jeff.jpg"
            },
            {
                "titulo": "Ben Drowned",
                "desc": "muleke amaldiçoado dentro de um cartucho do zelda... ele te persegue nos jogos",
                "img_url": "https://i.ibb.co/Sf3xKBG/ben.jpg"
            },
            {
                "titulo": "Laughing Jack",
                "desc": "palhaço do capeta que arranca suas tripa dando risada",
                "img_url": "https://i.ibb.co/yVvkZs3/jack.jpg"
            }
        ]

    @commands.command(name="creepypasta")
    async def creepypasta_dm(self, ctx, member: discord.Member = None):
        if member is None:
            await ctx.reply("marca alguém ae filhão `-creepypasta @user`")
            return

        pasta = random.choice(self.pastas)
        embed = discord.Embed(
            title=pasta["titulo"],
            description=pasta["desc"],
            color=discord.Color.red()
        )
        embed.set_image(url=pasta["img_url"])

        try:
            await member.send(embed=embed)
            await ctx.reply(f"mandei a creepypasta na dm de {member.mention} fi kkkk")
        except:
            await ctx.reply("n consegui mandar a dm do krai... ele deve ter bloqueado ou desativado as dms")

async def setup(bot):
    await bot.add_cog(CreepypastaDM(bot))
