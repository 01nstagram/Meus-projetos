import discord
from discord.ext import commands
from discord import app_commands
import random, json, os

class Beijo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.db_path = "beijostats.json"
        self.load_data()

    def load_data(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, "r") as f:
                self.stats = json.load(f)
        else:
            self.stats = {}

    def save_data(self):
        with open(self.db_path, "w") as f:
            json.dump(self.stats, f, indent=4)

    def add_beijo(self, sender_id, receiver_id):
        key = f"{sender_id}_{receiver_id}"
        self.stats[key] = self.stats.get(key, 0) + 1
        self.save_data()
        return self.stats[key]

    gifs = [
        "https://media.tenor.com/0Avz3XbsBNgAAAAC/anime-kiss.gif",
        "https://media.tenor.com/2whDdfkZH3EAAAAC/anime-kiss-cute.gif",
        "https://media.tenor.com/mM0jv1pTkKQAAAAC/kiss-anime.gif",
        "https://media.tenor.com/EkqTeeTTFQYAAAAC/anime-kiss-love.gif"
    ]

    @commands.command(name="beijo")
    async def beijo_prefix(self, ctx, user: discord.Member):
        await self.send_beijo(ctx, ctx.author, user)

    @app_commands.command(name="beijo", description="manda um beijinho pro @user com gif e botão")
    @app_commands.describe(user="quem vai levar o beijo")
    async def beijo_slash(self, interaction: discord.Interaction, user: discord.Member):
        await interaction.response.defer()
        await self.send_beijo(interaction, interaction.user, user)

    async def send_beijo(self, ctx_or_interaction, sender, receiver):
        gif = random.choice(self.gifs)
        count = self.add_beijo(sender.id, receiver.id)
        embed = discord.Embed(
            title="Beijoooo!",
            description=f"{sender.mention} deu um beijo em {receiver.mention}!\n\n**Total de beijos:** {count}",
            color=0xff69b4
        )
        embed.set_image(url=gif)

        view = BeijoButton(sender, receiver, self)
        if isinstance(ctx_or_interaction, commands.Context):
            await ctx_or_interaction.send(embed=embed, view=view)
        else:
            await ctx_or_interaction.followup.send(embed=embed, view=view)

class BeijoButton(discord.ui.View):
    def __init__(self, sender, receiver, cog):
        super().__init__(timeout=60)
        self.sender = sender
        self.receiver = receiver
        self.cog = cog

    @discord.ui.button(label="Retribuir Beijo", style=discord.ButtonStyle.blurple, emoji="💋")
    async def retribuir(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user.id != self.receiver.id:
            await interaction.response.send_message("só quem recebeu o beijo pode retribuir kkkkk", ephemeral=True)
            return

        count = self.cog.add_beijo(self.receiver.id, self.sender.id)
        embed = discord.Embed(
            title="Beijooo retribuído!",
            description=f"{self.receiver.mention} retribuiu o beijo pra {self.sender.mention}!\n\n**Total de beijos agora:** {count}",
            color=0xff1493
        )
        embed.set_image(url=random.choice(self.cog.gifs))
        await interaction.response.send_message(embed=embed)
        self.stop()

async def setup(bot):
    await bot.add_cog(Beijo(bot))
