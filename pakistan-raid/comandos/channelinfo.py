import discord
from discord.ext import commands
from discord import app_commands
from datetime import datetime

class ChannelInfo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="channel_info", help="Mostra informações sobre o canal atual")
    async def channel_info_prefix(self, ctx):
        channel = ctx.channel
        await ctx.send(embed=self.create_channel_embed(channel, ctx.author.display_name, ctx.author.avatar.url, ctx.guild))

    @app_commands.command(name="channel_info", description="Mostra informações sobre o canal atual")
    async def channel_info_slash(self, interaction: discord.Interaction):
        channel = interaction.channel
        user = interaction.user
        await interaction.response.send_message(embed=self.create_channel_embed(channel, user.display_name, user.avatar.url if user.avatar else None, interaction.guild))

    def create_channel_embed(self, channel, requester_name, requester_avatar, guild):
        category = channel.category.name if channel.category else "Sem categoria"
        topic = channel.topic if isinstance(channel, discord.TextChannel) and channel.topic else "Nenhum tópico"

        embed = discord.Embed(
            title=f"Informações do canal: #{channel.name}",
            color=discord.Color.blurple(),
            timestamp=datetime.utcnow()
        )
        embed.set_author(name=f"Servidor: {guild.name}", icon_url=guild.icon.url if guild.icon else None)
        embed.add_field(name="🆔 ID do Canal", value=f"`{channel.id}`", inline=True)
        embed.add_field(name="📅 Criado em", value=f"<t:{int(channel.created_at.timestamp())}:F>", inline=True)
        embed.add_field(name="🏷️ Categoria", value=f"`{category}`", inline=True)
        embed.add_field(name="🔒 Privado", value="Sim" if channel.overwrites else "Não", inline=True)
        embed.add_field(name="💬 Tópico", value=topic, inline=False)
        embed.add_field(name="📂 Tipo", value="Texto" if isinstance(channel, discord.TextChannel) else "Outro", inline=True)

        embed.set_footer(text=f"Solicitado por {requester_name}", icon_url=requester_avatar)
        return embed

async def setup(bot):
    await bot.add_cog(ChannelInfo(bot))
