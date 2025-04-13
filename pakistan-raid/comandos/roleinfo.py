import discord
from discord.ext import commands
from discord import app_commands
from datetime import datetime

class RoleInfo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="role_info", description="Mostra informações detalhadas sobre um cargo")
    async def role_info(self, interaction: discord.Interaction, role: discord.Role):
        permissions = ', '.join([str(p[0]).replace('_', ' ').title() for p in role.permissions if p[1]])
        if not permissions:
            permissions = "Nenhuma permissão"

        embed = discord.Embed(
            title=f"Informações do cargo: {role.name}",
            color=role.color,
            timestamp=datetime.utcnow()
        )

        guild_icon = interaction.guild.icon.url if interaction.guild.icon else discord.Embed.Empty
        user_avatar = interaction.user.avatar.url if interaction.user.avatar else interaction.user.default_avatar.url

        embed.set_author(name=interaction.guild.name, icon_url=guild_icon)
        if guild_icon:
            embed.set_thumbnail(url=guild_icon)

        embed.add_field(name="Nome", value=f'```{role.name}```', inline=True)
        embed.add_field(name="ID", value=f'```{role.id}```', inline=True)
        embed.add_field(name="Cor", value=f'```{role.color}```', inline=True)
        embed.add_field(name="Permissões", value=f'```json\n{permissions}\n```', inline=False)
        embed.add_field(name="Posição", value=role.position, inline=True)
        embed.add_field(name="Mencionável", value="Sim" if role.mentionable else "Não", inline=True)
        embed.add_field(name="Gerenciável", value="Sim" if role.managed else "Não", inline=True)
        embed.add_field(name="Membros com este cargo", value=str(len(role.members)), inline=True)
        embed.add_field(name="Cargo padrão", value="Sim" if role.is_default() else "Não", inline=True)
        embed.add_field(name="Cargo de integração", value="Sim" if role.is_integration() else "Não", inline=True)
        embed.add_field(name="Cargo de boost", value="Sim" if role.is_premium_subscriber() else "Não", inline=True)
        embed.add_field(name="Criado em", value=role.created_at.strftime("%d/%m/%Y %H:%M:%S"), inline=False)

        embed.set_footer(text=f"Solicitado por {interaction.user.display_name}", icon_url=user_avatar)

        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(RoleInfo(bot))
