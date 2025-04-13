import discord
from discord.ext import commands
from discord import app_commands, ui
from discord.ui import View, Select, Button
import json, os

ADM_LIST = ["Andrômeda", "tcpdeath", "x76"]
BANNER_URL = "https://cdn.discordapp.com/attachments/1360401112355569758/1360403674571997415/4f408a11de6af01ebd76f1bee11d7519.jpg"
ICON_URL = "https://cdn.discordapp.com/attachments/1360401112355569758/1360403583899668640/a9f0b16ca9174175dc1bf59c40e47754.jpg"

DATA_FILE = "verificacoes.json"

def salvar_painel(guild_id, canal_id, cargo_id):
    dados = {}
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            try:
                dados = json.load(f)
            except:
                dados = {}

    dados[str(guild_id)] = {
        "canal_id": canal_id,
        "cargo_id": cargo_id
    }

    with open(DATA_FILE, "w") as f:
        json.dump(dados, f, indent=4)

class SelectAdm(ui.Select):
    def __init__(self, bot, canal_id, cargo_id):
        self.bot = bot
        self.canal_id = canal_id
        self.cargo_id = cargo_id
        options = [discord.SelectOption(label=adm, description=f"vc conhece {adm}?") for adm in ADM_LIST]
        super().__init__(placeholder="qual ADM vc conhece?", min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        adm = self.values[0]
        canal = interaction.guild.get_channel(self.canal_id)

        embed = discord.Embed(
            title="nova ficha de verificação",
            description=f"**usuário:** {interaction.user.mention}\n**conhece o ADM:** `{adm}`",
            color=0x00ffcc
        )
        embed.set_thumbnail(url=ICON_URL)

        view = FichaView(self.bot, interaction.user.id, self.cargo_id)
        await canal.send(embed=embed, view=view)
        await interaction.response.send_message("tua ficha foi enviada pros adm, espera ae...", ephemeral=True)

class FichaView(View):
    def __init__(self, bot, user_id, cargo_id):
        super().__init__(timeout=None)
        self.bot = bot
        self.user_id = user_id
        self.cargo_id = cargo_id

    @ui.button(label="aceitar", style=discord.ButtonStyle.green, emoji="✅")
    async def aceitar(self, interaction: discord.Interaction, button: discord.ui.Button):
        membro = interaction.guild.get_member(self.user_id)
        if not membro:
            return await interaction.response.send_message("usuário já saiu do server kkkkk", ephemeral=True)
        cargo = interaction.guild.get_role(self.cargo_id)
        await membro.add_roles(cargo)
        await interaction.response.send_message(f"{membro.mention} foi aceito, virou verificado", ephemeral=False)
        try:
            await membro.send("parabéns você foi aceito no server.")
        except:
            pass

    @ui.button(label="rejeitar", style=discord.ButtonStyle.red, emoji="❌")
    async def rejeitar(self, interaction: discord.Interaction, button: discord.ui.Button):
        membro = interaction.guild.get_member(self.user_id)
        if not membro:
            return await interaction.response.send_message("o doente já saiu antes de tomar kick", ephemeral=True)
        try:
            await membro.send("vc foi rejeitado na verificação, sem choro")
        except:
            pass
        try:
            await membro.kick(reason="rejeitado na verificação")
            await interaction.response.send_message(f"{membro.mention} foi chutado do server kkk", ephemeral=False)
        except Exception as e:
            await interaction.response.send_message(f"erro ao tentar dar kick: {e}", ephemeral=True)

class Verificação(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="painelverificacao", description="cria o painel de verificação com select menu")
    @app_commands.describe(canal="canal onde vai cair a ficha", cargo="cargo que será dado se for aceito")
    async def painelverif_slash(self, interaction: discord.Interaction, canal: discord.TextChannel, cargo: discord.Role):
        salvar_painel(interaction.guild.id, canal.id, cargo.id)

        embed = discord.Embed(
            title="painel de verificação",
            description="escolhe qual ADM tu conhece pra passar na verificação e virar membro",
            color=0xff00ff
        )
        embed.set_thumbnail(url=ICON_URL)
        embed.set_image(url=BANNER_URL)

        view = View()
        view.add_item(SelectAdm(self.bot, canal.id, cargo.id))
        await interaction.response.send_message(embed=embed, view=view)

    @commands.command(name="painelverificacao")
    @commands.has_permissions(manage_guild=True)
    async def painelverif_prefix(self, ctx, canal: discord.TextChannel, cargo: discord.Role):
        salvar_painel(ctx.guild.id, canal.id, cargo.id)

        embed = discord.Embed(
            title="painel de verificação",
            description="escolhe qual ADM tu conhece pra passar na verificação e virar membro",
            color=0xff00ff
        )
        embed.set_thumbnail(url=ICON_URL)
        embed.set_image(url=BANNER_URL)

        view = View()
        view.add_item(SelectAdm(self.bot, canal.id, cargo.id))
        await ctx.send(embed=embed, view=view)

async def setup(bot):
    await bot.add_cog(Verificação(bot))
