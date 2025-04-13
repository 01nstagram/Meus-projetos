import re
import requests
import discord
import httpx
from discord.ext import commands

class Cep(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='cep', help='Busca informações sobre um CEP.')
    async def cep_prefix(self, ctx, cep):
        if not re.match(r'^\d{5}-\d{3}$', cep):
            embed = discord.Embed(
                title='⚠️ | ERRO DE FORMATO DE CEP!',
                description='O CEP fornecido parece estar em um formato incorreto. Deve ser algo como `-cep 12345-678`',
                color=discord.Color.red()
            )
            await ctx.reply(embed=embed)
            return

        url = f'https://viacep.com.br/ws/{cep}/json/'
        response = requests.get(url)
        data = response.json()

        await self.send_cep_embed(ctx, data, cep)

    @discord.app_commands.command(name='cep', description='Busca informações sobre um CEP.')
    async def cep_slash(self, interaction: discord.Interaction, cep: str):
        if not re.match(r'^\d{5}-\d{3}$', cep):
            embed = discord.Embed(
                title='⚠️ | ERRO DE FORMATO DE CEP!',
                description='O CEP fornecido parece estar em um formato incorreto. Deve ser algo como `12345-678`',
                color=discord.Color.red()
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
            return

        url = f'https://viacep.com.br/ws/{cep}/json/'
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()

        await self.send_cep_embed(interaction, data, cep)

    async def send_cep_embed(self, destino, data, cep):
        if 'erro' in data:
            embed = discord.Embed(
                title='⚠️ | ERRO DE CEP NÃO ENCONTRADO!',
                description='Desculpe, não consegui encontrar informações para o CEP fornecido. Verifique se ele está correto.',
                color=discord.Color.red()
            )
        else:
            maps_url = f'https://www.google.com/maps/search/?api=1&query={data["logradouro"].replace(" ", "+")},{data["localidade"].replace(" ", "+")},{data["uf"]}'

            embed = discord.Embed(
                title='🔎 | CEP ENCONTRADO!',
                description=f'**📬 CEP:** {data["cep"]}\n'
                            f'**🛣️ Logradouro:** {data["logradouro"]}\n'
                            f'**🏢 Complemento:** {data.get("complemento", "-")}\n'
                            f'**🏘️ Bairro:** {data["bairro"]}\n'
                            f'**🏙️ Cidade:** {data["localidade"]}\n'
                            f'**🗺️ Estado:** {data["uf"]}\n'
                            f'**📊 IBGE:** {data["ibge"]}\n'
                            f'**📈 GIA:** {data["gia"]}\n'
                            f'**📞 DDD:** {data["ddd"]}\n'
                            f'**💼 SIAFI:** {data["siafi"]}\n'
                            f'**📍 Google Maps:** [Link]({maps_url})',
                color=discord.Color.blue()
            )
            embed.set_footer(text='by x76')

        if isinstance(destino, discord.Interaction):
            await destino.response.send_message(embed=embed, ephemeral=True)
        else:
            await destino.reply(embed=embed)

async def setup(bot):
    await bot.add_cog(Cep(bot))
