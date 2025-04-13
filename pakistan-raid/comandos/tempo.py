import discord
from discord.ext import commands
from discord import app_commands
import json
from datetime import datetime, timedelta, timezone
import os

DB_PATH = "call_data.json"

def carregar_dados():
    if not os.path.exists(DB_PATH):
        return {}
    try:
        with open(DB_PATH, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def salvar_dados(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=4)

def formatar_tempo_hms(segundos):
    tempo = timedelta(seconds=int(segundos))
    dias, resto = divmod(tempo.total_seconds(), 86400)
    horas, resto = divmod(resto, 3600)
    minutos, segundos = divmod(resto, 60)
    return f"{int(horas)} horas, {int(minutos)} minutos, {int(segundos)} segundos"

class TempoCommand(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="tempo", description="veja quanto tempo vc passou em call")
    async def tempo_slash(self, interaction: discord.Interaction):
        data = carregar_dados()
        user_id = str(interaction.user.id)

        tempo_total = data.get(user_id, {}).get("tempo_total", 0)
        call_atual = data.get(user_id, {}).get("call_atual")

        # se o user ainda ta em call, soma tempo ao vivo
        if call_atual:
            try:
                entrou = datetime.fromisoformat(call_atual).replace(tzinfo=timezone.utc)
                tempo_total += int((datetime.now(timezone.utc) - entrou).total_seconds())
            except:
                pass

        tempo_formatado = formatar_tempo_hms(tempo_total)
        ultima_data = call_atual or "N/A"

        # formatar data pra estilo bonito
        if ultima_data != "N/A":
            dt = datetime.fromisoformat(ultima_data)
            ultima_data = dt.strftime("%d/%m/%Y, %H:%M:%S")

        embed = discord.Embed(
            title=f"🟣 Tempo de {interaction.user.display_name} - {interaction.user.discriminator}#",
            color=0x9b59b6  # roxinho estiloso
        )
        embed.set_thumbnail(url=interaction.user.display_avatar.url)
        embed.add_field(name="🕐 Tempo Salvo", value=tempo_formatado, inline=False)
        embed.add_field(name="💲 Pontos", value="00", inline=False)
        embed.add_field(name="🏆 Ranking", value="`/rankingcall`", inline=False)

        embed.add_field(name="📢 Informações de Conexão", value=f"""
**📷** {tempo_formatado}
**🔊** 👑 • Celebrity 01 - 100%
**▶️** {ultima_data}
""", inline=False)

        embed.set_footer(text="YukiBot - | Hoje às " + datetime.now().strftime("%H:%M"))

        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(TempoCommand(bot))
