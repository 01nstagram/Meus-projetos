import discord
from discord.ext import commands
from discord import app_commands
import math
import re

class Calc(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

        # só registra o comando slash aqui se não tiver sido adicionado antes
        if not any(cmd.name == "calc" for cmd in self.bot.tree.get_commands()):
            self.bot.tree.add_command(app_commands.Command(
                name="calc",
                description="Calcula uma expressão matemática.",
                callback=self.calc_slash
            ))

    def safe_eval(self, expr):
        allowed_chars = re.compile(r'^[0-9+\-*/()., sqrt pow sin cos tan pi e]+$')
        if not allowed_chars.match(expr.replace(' ', '')):
            raise ValueError("Expressão inválida")

        expr = expr.replace('sqrt', 'math.sqrt')
        expr = expr.replace('pow', 'math.pow')
        expr = expr.replace('sin', 'math.sin')
        expr = expr.replace('cos', 'math.cos')
        expr = expr.replace('tan', 'math.tan')
        expr = expr.replace('pi', 'math.pi')
        expr = expr.replace('e', 'math.e')

        try:
            return eval(expr, {"math": math})
        except Exception:
            raise ValueError("Erro na avaliação da expressão")

    @commands.command(name='calc', help='Calcula uma expressão matemática.')
    async def calc_prefix(self, ctx: commands.Context, *, expression: str):
        await self.execute_calc(ctx, expression, is_interaction=False)

    async def calc_slash(self, interaction: discord.Interaction, expression: str):
        await self.execute_calc(interaction, expression, is_interaction=True)

    async def execute_calc(self, origem, expression: str, is_interaction: bool):
        try:
            result = self.safe_eval(expression)
            embed = discord.Embed(
                title="📊 Resultado do Cálculo",
                description=f"**Expressão:** `{expression}`\n**Resultado:** `{result}`",
                color=discord.Color.green()
            )
        except ValueError as e:
            embed = discord.Embed(
                title="🚫 Erro no Cálculo",
                description=f"**Expressão:** `{expression}`\n**Erro:** `{str(e)}`",
                color=discord.Color.red()
            )

        embed.set_footer(text="YukiBot", icon_url="https://cdn.discordapp.com/avatars/1360348816217477190/a91bc8596601d8f2d0442e4a71197ba1.png?size=1024")

        if is_interaction:
            await origem.response.send_message(embed=embed)
        else:
            await origem.reply(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(Calc(bot))
