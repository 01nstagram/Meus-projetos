import discord
import aiohttp
from discord.ext import commands
from discord import app_commands

class ScamInvite(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def fetch_invite_data(self, invite_code):
        url = f"https://discord.com/api/v10/invites/{invite_code}?with_counts=true&with_expiration=true"
        headers = {"Authorization": f"Bot {self.bot.http.token}"}

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                if resp.status != 200:
                    return None
                return await resp.json()

    @commands.command(name="scaminvite")
    async def scaminvite_prefix(self, ctx, invite: str):
        await self.send_invite_info(ctx, invite, ctx.author)

    @app_commands.command(name="scaminvite", description="Analisa um convite do Discord e mostra as infos")
    @app_commands.describe(invite="O link ou código do convite (ex: discord.gg/pakistan)")
    async def scaminvite_slash(self, interaction: discord.Interaction, invite: str):
        await self.send_invite_info(interaction, invite, interaction.user)

    async def send_invite_info(self, context, invite, user):
        invite_code = invite.split("/")[-1]
        data = await self.fetch_invite_data(invite_code)

        if not data:
            if isinstance(context, discord.Interaction):
                return await context.response.send_message("invite inválido ou inexistente fia", ephemeral=True)
            else:
                return await context.send("invite inválido ou inexistente fia")

        guild = data.get("guild", {})
        channel = data.get("channel", {})
        inviter = data.get("inviter", {})

        embed = discord.Embed(
            title="Análise de Invite",
            description=f"invite: `discord.gg/{invite_code}`",
            color=discord.Color.red()
        )

        embed.add_field(name="Servidor", value=guild.get("name", "desconhecido"), inline=True)
        embed.add_field(name="ID", value=guild.get("id", "n/a"), inline=True)
        embed.add_field(name="Membros Online", value=data.get("approximate_presence_count", "n/a"), inline=True)
        embed.add_field(name="Membros Totais", value=data.get("approximate_member_count", "n/a"), inline=True)
        embed.add_field(name="Canal", value=channel.get("name", "n/a"), inline=True)

        if inviter:
            embed.add_field(name="Criado por", value=f"{inviter.get('username')}#{inviter.get('discriminator')}", inline=False)

        embed.set_footer(text="by Pakistan Hunters")

        if isinstance(context, discord.Interaction):
            await context.response.send_message(embed=embed, ephemeral=False)
        else:
            await context.send(embed=embed)

async def setup(bot):
    await bot.add_cog(ScamInvite(bot))
