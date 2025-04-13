import discord
from discord.ext import commands
from discord import app_commands
import aiohttp
from PIL import Image
from io import BytesIO
from datetime import datetime

class AddEmoji(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def get_image_color(self, url):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                image_bytes = await response.read()
                image = Image.open(BytesIO(image_bytes)).convert("RGB")
                pixels = list(image.getdata())
                avg_color = tuple(sum(c) // len(c) for c in zip(*pixels))
                return discord.Color.from_rgb(*avg_color), image_bytes

    async def process_emoji(self, origem, emoji_str, is_interaction):
        try:
            emoji_id = None
            emoji_name = None

            if emoji_str.startswith('<:') and emoji_str.endswith('>'):
                emoji_id = emoji_str.split(':')[2][:-1]
            elif emoji_str.startswith('<a:') and emoji_str.endswith('>'):
                emoji_id = emoji_str.split(':')[2][:-1]
            elif emoji_str.startswith(':') and emoji_str.endswith(':'):
                emoji_name = emoji_str.strip(':')
            else:
                return await self.send_error(origem, "Formato inválido de emoji!", is_interaction)

            emoji_to_add = None
            for guild in self.bot.guilds:
                if emoji_id:
                    emoji_to_add = discord.utils.get(guild.emojis, id=int(emoji_id))
                elif emoji_name:
                    emoji_to_add = discord.utils.get(guild.emojis, name=emoji_name)
                if emoji_to_add:
                    break

            if not emoji_to_add:
                return await self.send_error(origem, f"Emoji `{emoji_str}` não encontrado.", is_interaction)

            emoji_url = str(emoji_to_add.url)
            avg_color, image_bytes = await self.get_image_color(emoji_url)

            guild = origem.guild

            if len(guild.emojis) >= guild.emoji_limit:
                return await self.send_error(origem, "Limite de emojis atingido neste servidor!", is_interaction)

            existing = discord.utils.get(guild.emojis, name=emoji_to_add.name)
            if existing:
                await existing.delete()

            new_emoji = await guild.create_custom_emoji(name=emoji_to_add.name, image=image_bytes)

            embed = discord.Embed(
                title="✅ Emoji Adicionado",
                description=f"O emoji `{new_emoji.name}` foi adicionado com sucesso!",
                color=avg_color,
                timestamp=datetime.utcnow()
            )
            embed.add_field(name="Emoji", value=f"{new_emoji}", inline=True)
            embed.add_field(name="Nome", value=f"`{new_emoji.name}`", inline=True)
            embed.add_field(name="ID", value=f"`{new_emoji.id}`", inline=True)
            embed.add_field(name="URL", value=f"[Ver Emoji]({new_emoji.url})", inline=True)
            embed.set_thumbnail(url=new_emoji.url)

            user = origem.user if is_interaction else origem.author
            embed.set_footer(text=f"Adicionado por {user}", icon_url=user.display_avatar.url)

            if is_interaction:
                await origem.response.send_message(embed=embed)
            else:
                await origem.reply(embed=embed)

        except Exception as e:
            print(f"Erro ao adicionar emoji: {e}")
            await self.send_error(origem, "Erro ao tentar adicionar o emoji.", is_interaction)

    async def send_error(self, origem, mensagem, is_interaction):
        embed = discord.Embed(title="❌ Erro", description=mensagem, color=discord.Color.red())
        if is_interaction:
            await origem.response.send_message(embed=embed, ephemeral=True)
        else:
            await origem.reply(embed=embed)

    # Comando com prefixo
    @commands.command(name="addemoji", help="Adiciona um emoji de outro servidor")
    @commands.has_permissions(manage_emojis=True)
    async def addemoji_prefix(self, ctx, emoji: str):
        await self.process_emoji(ctx, emoji, is_interaction=False)

    # Comando Slash
    @app_commands.command(name="addemoji", description="Adiciona um emoji de outro servidor")
    @app_commands.checks.has_permissions(manage_emojis=True)
    async def addemoji_slash(self, interaction: discord.Interaction, emoji: str):
        await self.process_emoji(interaction, emoji, is_interaction=True)

    async def cog_load(self):
        # Adicionar o comando Slash
        try:
            await self.bot.tree.sync()  # Sincroniza os comandos Slash com o bot
        except discord.app_commands.errors.CommandAlreadyRegistered:
            pass

async def setup(bot):
    await bot.add_cog(AddEmoji(bot))
