import discord
from discord.ext import commands
import json
import os

class Backup(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        if not os.path.exists("backups"):
            os.makedirs("backups")  # cria a pasta se não existir

    async def criar_backup(self, guild):
        dados = {
            "nome": guild.name,
            "canais": [canal.name for canal in guild.text_channels],
            "cargos": [cargo.name for cargo in guild.roles if not cargo.is_default()]
        }

        path = f"backups/backup_{guild.id}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)

    @commands.command(name="backup", help="cria um backup do server")
    async def backup_cmd(self, ctx):
        if not ctx.author.guild_permissions.administrator:
            return await ctx.send("❌ tu não é adm zé ruela")

        await self.criar_backup(ctx.guild)
        await ctx.send("✅ backup criado com sucesso!")

    @commands.command(name="restorebackup", help="restaura o backup do server")
    async def restore_backup_cmd(self, ctx):
        if not ctx.author.guild_permissions.administrator:
            return await ctx.send("❌ precisa ser adm pra usar isso parça")

        path = f"backups/backup_{ctx.guild.id}.json"
        if not os.path.exists("backups"):
            os.makedirs("backups")
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"nome": "", "canais": [], "cargos": []}, f, indent=4)
            return await ctx.send("⚠️ backup ainda não existe, criei um vazio pra tu")

        with open(path, "r", encoding="utf-8") as f:
            backup = json.load(f)

        try:
            await ctx.guild.edit(name=backup["nome"])
            
            for canal in ctx.guild.text_channels:
                await canal.delete()
            for ch in backup["canais"]:
                await ctx.guild.create_text_channel(ch)

            for role in ctx.guild.roles:
                if not role.is_default():
                    await role.delete()
            for role in backup["cargos"]:
                await ctx.guild.create_role(name=role)

            await ctx.send("✅ backup restaurado com sucesso!")
        except Exception as e:
            await ctx.send(f"❌ erro ao restaurar: {e}")

async def setup(bot):
    await bot.add_cog(Backup(bot))
