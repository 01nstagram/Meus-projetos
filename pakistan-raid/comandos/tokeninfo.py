import discord
import requests
from discord.ext import commands
from discord import app_commands
from discord.ui import View, Button

class TokenInfoView(View):
    def __init__(self, full_info):
        super().__init__()
        self.full_info = full_info

    @discord.ui.button(label="Baixar Informações Completas 🔎", style=discord.ButtonStyle.blurple)
    async def download_button_callback(self, interaction: discord.Interaction, button: Button):
        with open("token_info.txt", "w", encoding='utf-8') as file:
            file.write(self.full_info)
        
        await interaction.response.send_message(file=discord.File("token_info.txt"), ephemeral=True)

class TokenInfo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='tokeninfo', help='Obtém informações detalhadas sobre um token Discord')
    async def tokeninfo_cmd(self, ctx, token: str):
        await self.process_token(ctx, token, is_interaction=False)

    @app_commands.command(name='tokeninfo', description='Obtém informações detalhadas sobre um token do Discord')
    async def tokeninfo_slash(self, interaction: discord.Interaction, token: str):
        await self.process_token(interaction, token, is_interaction=True)

    async def process_token(self, ctx_or_interaction, token: str, is_interaction: bool):
        send = ctx_or_interaction.response.send_message if is_interaction else ctx_or_interaction.reply

        try:
            if not is_interaction:
                await ctx_or_interaction.reply("```Fix\nRecuperando informações ⏳\n```")

            headers = {'Authorization': token}
            user_response = requests.get('https://discord.com/api/v8/users/@me', headers=headers).json()

            if 'username' not in user_response:
                await send("```😐 Token inválido ou resposta inesperada da API.```", ephemeral=True if is_interaction else False)
                return

            username = f"{user_response['username']}#{user_response['discriminator']}"
            user_id = user_response['id']
            avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{user_response['avatar']}.png"
            email = user_response.get('email', 'N/A')
            phone = user_response.get('phone', 'N/A')
            mfa = user_response.get('mfa_enabled', False)

            nitro = 'Nitro' if requests.get('https://discord.com/api/v8/users/@me/billing/subscriptions', headers=headers).json() else 'Nenhum'

            billing = requests.get('https://discord.com/api/v8/users/@me/billing/payment-sources', headers=headers).json()
            payment_methods = [':credit_card:' if m['type'] == 1 else ':paypal:' for m in billing] if billing else []
            payment_methods_str = ' '.join(payment_methods) or 'Nenhum'

            guilds = requests.get('https://discord.com/api/v8/users/@me/guilds', headers=headers).json()
            guilds_info_str = '\n'.join([f"{g['name']} ({g['id']})" for g in guilds]) if guilds else 'Nenhum'

            friends = requests.get('https://discord.com/api/v8/users/@me/relationships', headers=headers).json()
            friends_info_str = '\n'.join([f"{f['user']['username']}#{f['user']['discriminator']} ({f['user']['id']})" for f in friends]) if friends else 'Nenhum'

            embed = discord.Embed(title="Informações do Token Discord", color=discord.Color.red())
            embed.set_thumbnail(url=avatar_url)
            embed.add_field(name="Nome de Usuário", value=f"```\n{username}\n```", inline=False)
            embed.add_field(name="ID", value=f"```\n{user_id}\n```", inline=False)
            embed.add_field(name="E-mail", value=f"```\n{email}\n```", inline=False)
            embed.add_field(name="Telefone", value=f"```\n{phone}\n```", inline=False)
            embed.add_field(name="Nitro", value=f"```\n{nitro}\n```", inline=False)
            embed.add_field(name="Autenticação Multifator", value=f"```\n{mfa}\n```", inline=False)

            full_info = f"""
==========================================
Informações do Token Discord
==========================================

Nome de Usuário:         {username}
ID:                      {user_id}
E-mail:                  {email}
Telefone:                {phone}
Token:                   {token}
Nitro:                   {nitro}
Autenticação Multifator: {mfa}

==========================================
Métodos de Pagamento
==========================================
{payment_methods_str}

==========================================
Servidores
==========================================
{guilds_info_str}

==========================================
Amigos
==========================================
{friends_info_str}
"""

            view = TokenInfoView(full_info)
            await send(embed=embed, view=view, ephemeral=True if is_interaction else False)

        except Exception as e:
            print(e)
            await send("```🙁 Não foi possível recuperar informações com este token.```", ephemeral=True if is_interaction else False)

async def setup(bot):
    await bot.add_cog(TokenInfo(bot))
