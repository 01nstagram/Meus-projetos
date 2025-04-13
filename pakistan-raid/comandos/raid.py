import discord
import os
import subprocess
import asyncio
import platform
import re
from discord.ext import commands

def is_valid_token(token):
    """Verifica se o token é válido"""
    if not token or ' ' in token:
        return False
    if len(token) < 16:
        return False
    prohibited_characters = r'[\/(),&]'
    if re.search(prohibited_characters, token):
        return False
    return True

class Raid(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def raid(self, ctx, *, token):
        """Comando para iniciar o raid bot"""
        if not is_valid_token(token):
            embed_error = discord.Embed(
                title="deu erro aqui mano",
                description="__Token inválido kkkk__",
                color=discord.Color.red()
            )
            await ctx.reply(embed=embed_error)
            return

        user_id = str(ctx.author.id)
        
        try:
            user = await self.bot.fetch_user(ctx.author.id)
        except discord.HTTPException:
            embed_error = discord.Embed(
                title="deu erro aqui mano",
                description="__nao consegui achar o usuario mano.__",
                color=discord.Color.red()
            )
            await ctx.reply(embed=embed_error)
            return

        try:
            embed_start = discord.Embed(
                title="💠 Iniciando Raid Bot",
                description="__O Raid Bot está sendo iniciado!__\n- ***Você receberá uma mensagem direta com mais detalhes***",
                color=discord.Color.blue()
            )
            await ctx.reply(embed=embed_start)

            embed_notify = discord.Embed(
                title="🔔 Raid Bot Iniciado!",
                description="__O Raid Bot foi iniciado. Acompanhe os detalhes na aba de mensagens diretas.__",
                color=discord.Color.green()
            )
            await user.send(embed=embed_notify)

            script_path = os.path.abspath(os.path.join("script", "raid_bot.py"))

            if not os.path.exists(script_path):
                print(f"ERRO: Arquivo não encontrado -> {script_path}")

                if platform.system() == "Windows":
                    os.startfile(os.path.abspath("pakistan\\script"))
                else:
                    subprocess.Popen(["xdg-open", os.path.abspath("pakistan/script")])

                embed_error = discord.Embed(
                    title="💔 Erro",
                    description=f"__Arquivo não encontrado: `{script_path}`__",
                    color=discord.Color.red()
                )
                await ctx.reply(embed=embed_error)
                return

            process = subprocess.Popen(
                ["python" if platform.system() == "Windows" else "python3", script_path, token, user_id], 
                shell=False
            )

            async def wait_for_completion():
                """Espera 5 minutos e mata o processo se ainda estiver rodando"""
                await asyncio.sleep(300)
                if process.poll() is None:
                    process.terminate()
                    embed_end = discord.Embed(
                        title="Raid encerrado",
                        description="__O Raid Bot foi encerrado após 5 minuto :Q__",
                        color=discord.Color.red()
                    )
                    await user.send(embed=embed_end)

            await wait_for_completion()

        except Exception as e:
            embed_error = discord.Embed(
                title="💔 Erro",
                description=f"__Ocorreu um erro durante a execução do comando: `{str(e)}`__",
                color=discord.Color.red()
            )
            await ctx.reply(embed=embed_error)

async def setup(bot):
    """Adiciona a cog ao bot"""
    await bot.add_cog(Raid(bot))
