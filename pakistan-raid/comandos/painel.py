import discord
from discord.ext import commands
from discord import app_commands
import json
import os

ID_AUTORIZADO = [1356668917648719962]

def pegar_cor():
    if not os.path.exists("Config/config.json"):
        with open("Config/config.json", "w") as f:
            json.dump({"embed_color": 0x2f3136}, f)
    with open("Config/config.json", "r") as f:
        config = json.load(f)
        return config.get("embed_color", 0x2f3136)

class NomeModal(discord.ui.Modal, title="Mudar Nome"):
    nome = discord.ui.TextInput(label="Novo nome do bot")

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.client.user.edit(username=self.nome.value)
        await interaction.response.send_message(f"Nome mudado pra: `{self.nome.value}`", ephemeral=True)

class BioModal(discord.ui.Modal, title="Mudar Bio"):
    bio = discord.ui.TextInput(label="Nova bio do bot")

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.client.user.edit(bio=self.bio.value)
        await interaction.response.send_message("Bio mudada com sucesso", ephemeral=True)

class StatusModal(discord.ui.Modal, title="Mudar Status"):
    status = discord.ui.TextInput(label="Digite: online, idle, dnd ou invisible")

    async def on_submit(self, interaction: discord.Interaction):
        status_map = {
            "online": discord.Status.online,
            "idle": discord.Status.idle,
            "dnd": discord.Status.dnd,
            "invisible": discord.Status.invisible
        }
        novo = self.status.value.lower()
        if novo not in status_map:
            await interaction.response.send_message("Status inválido", ephemeral=True)
            return
        await interaction.client.change_presence(status=status_map[novo])
        await interaction.response.send_message(f"Status mudado pra `{novo}`", ephemeral=True)

class TextoStatusModal(discord.ui.Modal, title="Mudar Texto do Status"):
    texto = discord.ui.TextInput(label="Novo texto do status")

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.client.change_presence(activity=discord.Game(name=self.texto.value))
        await interaction.response.send_message("Texto do status atualizado", ephemeral=True)

class FotoModal(discord.ui.Modal, title="Mudar Foto"):
    link = discord.ui.TextInput(label="Link da nova foto (jpg/png)")

    async def on_submit(self, interaction: discord.Interaction):
        try:
            async with interaction.client.http._HTTPClient__session.get(self.link.value) as resp:
                if resp.status != 200:
                    return await interaction.response.send_message("Erro ao baixar imagem", ephemeral=True)
                data = await resp.read()
                await interaction.client.user.edit(avatar=data)
                await interaction.response.send_message("Foto mudada", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Erro: {e}", ephemeral=True)

class BannerModal(discord.ui.Modal, title="Mudar Banner"):
    link = discord.ui.TextInput(label="Link do novo banner (jpg/png)")

    async def on_submit(self, interaction: discord.Interaction):
        try:
            async with interaction.client.http._HTTPClient__session.get(self.link.value) as resp:
                if resp.status != 200:
                    return await interaction.response.send_message("Erro ao baixar imagem", ephemeral=True)
                data = await resp.read()
                await interaction.client.user.edit(banner=data)
                await interaction.response.send_message("Banner mudado", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Erro: {e}", ephemeral=True)

class CorModal(discord.ui.Modal, title="Mudar Cor do Embed"):
    cor = discord.ui.TextInput(label="Nova cor (hex, ex: #ff0000)")

    async def on_submit(self, interaction: discord.Interaction):
        cor = self.cor.value.replace("#", "")
        try:
            cor_int = int(cor, 16)
            with open("Config/config.json", "r") as f:
                config = json.load(f)
            config["embed_color"] = cor_int
            with open("Config/config.json", "w") as f:
                json.dump(config, f)
            await interaction.response.send_message("Cor de embed atualizada", ephemeral=True)
        except:
            await interaction.response.send_message("Cor inválida", ephemeral=True)

class ViewPainel(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Mudar Nome", style=discord.ButtonStyle.primary, custom_id="mudar_nome")
    async def mudar_nome(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(NomeModal())

    @discord.ui.button(label="Mudar Bio", style=discord.ButtonStyle.primary, custom_id="mudar_bio")
    async def mudar_bio(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(BioModal())

    @discord.ui.button(label="Mudar Status", style=discord.ButtonStyle.primary, custom_id="mudar_status")
    async def mudar_status(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(StatusModal())

    @discord.ui.button(label="Mudar Texto Status", style=discord.ButtonStyle.primary, custom_id="mudar_texto_status")
    async def mudar_texto_status(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(TextoStatusModal())

    @discord.ui.button(label="Mudar Foto", style=discord.ButtonStyle.primary, custom_id="mudar_foto")
    async def mudar_foto(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(FotoModal())

    @discord.ui.button(label="Mudar Banner", style=discord.ButtonStyle.primary, custom_id="mudar_banner")
    async def mudar_banner(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(BannerModal())

    @discord.ui.button(label="Mudar Cor Embed", style=discord.ButtonStyle.primary, custom_id="mudar_cor")
    async def mudar_cor(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(CorModal())

class Painel(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="painelconfig", description="Abrir painel de config do bot")
    async def painelconfig(self, interaction: discord.Interaction):
        if interaction.user.id not in ID_AUTORIZADO:
            await interaction.response.send_message("tu n tem perm pra usar isso", ephemeral=True)
            return

        embed = discord.Embed(
            title="Painel de Configuração - PAKISTAN BOT",
            description="Configura as paradas tudo aqui",
            color=pegar_cor()
        )
        await interaction.response.send_message(embed=embed, view=ViewPainel(), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(Painel(bot))
