import discord
from discord import app_commands
from discord.ext import commands

class SayCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="say", description="Faz o bot falar o que você quiser em um canal específico")
    @app_commands.describe(
        message="A mensagem que o bot deve dizer",
        channel="O canal onde a mensagem será enviada (opcional)"
    )
    async def say(self, interaction: discord.Interaction, message: str, channel: discord.TextChannel = None):
        # Se o canal não for fornecido, use o canal onde o comando foi executado
        if channel is None:
            channel = interaction.channel

        await channel.send(message)  # O bot envia a mensagem no canal especificado
        await interaction.response.send_message(f"Mensagem enviada no canal: {channel.mention}", ephemeral=True)  # Feedback para o usuário

# Configura o Cog
async def setup(bot):
    await bot.add_cog(SayCog(bot))
