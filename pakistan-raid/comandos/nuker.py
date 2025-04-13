import discord
from discord import app_commands
from discord.ext import commands

class NukeCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # SLASHCOMMAND
    @app_commands.command(name="nuke", description="duplica e deleta o canal, estilo pakistan hunters")
    async def nuke_slash(self, interaction: discord.Interaction):
        await self._nuke(interaction.channel, interaction.guild, interaction.user, interaction)

    # PREFIXO NORMAL
    @commands.command(name="nuke", help="duplica e deleta o canal, estilo pakistan hunters")
    async def nuke_prefix(self, ctx: commands.Context):
        await self._nuke(ctx.channel, ctx.guild, ctx.author, ctx)

    # FUNÇÃO COMPARTILHADA PRA NUKAR GERAL
    async def _nuke(self, channel, guild, user, context):
        perms = channel.permissions_for(guild.me)
        if not perms.manage_channels:
            msg = "fi eu n tenho perm de gerenciar canal kkkkkk me dá isso ae"
            if isinstance(context, discord.Interaction):
                return await context.response.send_message(msg, ephemeral=True)
            else:
                return await context.send(msg)

        try:
            if isinstance(context, discord.Interaction):
                await context.response.send_message(f"{user.mention} iniciou o NUKÃO do canal... bum!", ephemeral=True)
            else:
                await context.send(f"{user.mention} iniciou o NUKÃO do canal... bum!")

            channel_position = channel.position
            overwrites = channel.overwrites
            category = channel.category

            # clona
            new_channel = await channel.clone(name=channel.name)
            await new_channel.edit(position=channel_position, category=category, overwrites=overwrites)

            # deleta canal original
            try:
                await channel.delete()
            except discord.Forbidden:
                await new_channel.send(f"n consegui deletar o canal antigo {channel.name}, perm faltando fi")
            except Exception as e:
                await new_channel.send(f"deu merda tentando deletar o canal: `{e}`")

            await new_channel.send(f"**{user.mention} mandou o NUKÃO com estilo da PAKISTAN HUNTERS**")

        except Exception as e:
            if isinstance(context, discord.Interaction):
                await context.followup.send(f"deu ruim no processo de nuke: `{e}`", ephemeral=True)
            else:
                await context.send(f"deu ruim no processo de nuke: `{e}`")

# setup do cog
async def setup(bot):
    await bot.add_cog(NukeCog(bot))
