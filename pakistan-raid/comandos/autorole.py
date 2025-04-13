import discord
import json
import os
from discord.ext import commands
from discord import app_commands

CONFIG_PATH = "json/commands/autorole_config.json"
os.makedirs("json", exist_ok=True)

def carregar_autorole():
    if not os.path.exists(CONFIG_PATH):
        return {}
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def salvar_autorole(data):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

class AutoRole(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.config = carregar_autorole()

    def salvar_config(self):
        salvar_autorole(self.config)

    @commands.Cog.listener()
    async def on_member_join(self, member):
        guild_id = str(member.guild.id)
        if guild_id in self.config:
            role_id = self.config[guild_id]
            role = member.guild.get_role(role_id)
            if role:
                try:
                    await member.add_roles(role, reason="Auto Role ativado")
                except discord.Forbidden:
                    pass

    # comando prefixado
    @commands.command(name="setautorole", help="Define um cargo automático para novos membros")
    @commands.has_permissions(manage_roles=True)
    async def set_autorole_prefix(self, ctx, role: discord.Role):
        self.config[str(ctx.guild.id)] = role.id
        self.salvar_config()
        await ctx.send(f"✅ Auto role configurado para `{role.name}`!")

    @commands.command(name="removeautorole", help="Remove o cargo automático")
    @commands.has_permissions(manage_roles=True)
    async def remove_autorole_prefix(self, ctx):
        if str(ctx.guild.id) in self.config:
            del self.config[str(ctx.guild.id)]
            self.salvar_config()
            await ctx.send("❌ Auto role removido com sucesso!")
        else:
            await ctx.send("⚠️ Nenhum auto role está configurado para esse servidor.")

    # slashcommand
    @app_commands.command(name="setautorole", description="Define um cargo automático para novos membros")
    @app_commands.checks.has_permissions(manage_roles=True)
    async def set_autorole_slash(self, interaction: discord.Interaction, role: discord.Role):
        self.config[str(interaction.guild.id)] = role.id
        self.salvar_config()
        await interaction.response.send_message(f"✅ Auto role configurado para `{role.name}`!", ephemeral=True)

    @app_commands.command(name="removeautorole", description="Remove o cargo automático configurado")
    @app_commands.checks.has_permissions(manage_roles=True)
    async def remove_autorole_slash(self, interaction: discord.Interaction):
        if str(interaction.guild.id) in self.config:
            del self.config[str(interaction.guild.id)]
            self.salvar_config()
            await interaction.response.send_message("❌ Auto role removido com sucesso!", ephemeral=True)
        else:
            await interaction.response.send_message("⚠️ Nenhum auto role está configurado para esse servidor.", ephemeral=True)

async def setup(bot):
    await bot.add_cog(AutoRole(bot))
