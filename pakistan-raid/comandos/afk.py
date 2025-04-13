import discord
from discord.ext import commands
from discord import app_commands

class AfkCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.afks = {}  # {user_id: {"motivo": str, "nick": str}}

    # afk por prefixo
    @commands.command(name="afk")
    async def afk_prefix(self, ctx, *, motivo="sem motivo"):
        if ctx.author.id in self.afks:
            await ctx.send("tu já tá afk fi")
            return

        nick_antigo = ctx.author.display_name
        try:
            await ctx.author.edit(nick=f"[AFK] {nick_antigo}")
        except:
            pass  # ignora se n tiver perm

        self.afks[ctx.author.id] = {"motivo": motivo, "nick": nick_antigo}
        await ctx.send(f"{ctx.author.mention} agora tá AFK: `{motivo}`")

    # afk por slash
    @app_commands.command(name="afk", description="ativa o modo afk")
    @app_commands.describe(motivo="motivo do afk")
    async def afk_slash(self, interaction: discord.Interaction, motivo: str = "sem motivo"):
        user = interaction.user

        if user.id in self.afks:
            await interaction.response.send_message("tu já tá afk fi", ephemeral=True)
            return

        nick_antigo = user.display_name
        try:
            await user.edit(nick=f"[AFK] {nick_antigo}")
        except:
            pass

        self.afks[user.id] = {"motivo": motivo, "nick": nick_antigo}
        await interaction.response.send_message(f"{user.mention} agora tá AFK: `{motivo}`")

    # detectar msg e tirar afk
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return

        ctx = await self.bot.get_context(message)
        if ctx.valid:
            return  # se for comando, ignora

        if message.author.id in self.afks:
            data = self.afks.pop(message.author.id)
            try:
                await message.author.edit(nick=data["nick"])
            except:
                pass
            await message.channel.send(f"{message.author.mention} voltou do AFK, bem-vindo de volta seu inútil")

        # ver se marcou alguém que tá afk
        for user in message.mentions:
            if user.id in self.afks:
                motivo = self.afks[user.id]["motivo"]
                await message.channel.send(f"{user.mention} tá AFK: `{motivo}`")

# setup
async def setup(bot):
    await bot.add_cog(AfkCog(bot))
