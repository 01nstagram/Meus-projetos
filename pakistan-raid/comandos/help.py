from discord.ext import commands
from pathlib import Path
import discord
import json
import asyncio

class PaginatorView(discord.ui.View):
    def __init__(self, pages, user):
        super().__init__(timeout=180)
        self.pages = pages
        self.current_page = 0
        self.user = user

    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        return interaction.user == self.user

    @discord.ui.button(label="⬅️ Anterior", style=discord.ButtonStyle.primary, disabled=True)
    async def previous_page(self, interaction: discord.Interaction, button: discord.ui.Button):
        self.current_page -= 1
        await self.update_page(interaction)

    @discord.ui.button(label="Próxima ➡️", style=discord.ButtonStyle.primary)
    async def next_page(self, interaction: discord.Interaction, button: discord.ui.Button):
        self.current_page += 1
        await self.update_page(interaction)

    async def update_page(self, interaction):
        for child in self.children:
            child.disabled = False

        if self.current_page == 0:
            self.previous_page.disabled = True
        if self.current_page == len(self.pages) - 1:
            self.next_page.disabled = True

        await interaction.response.edit_message(embed=self.pages[self.current_page], view=self)

class Help(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def create_pages(self, commands_list):
        chunks = [commands_list[i:i + 3] for i in range(0, len(commands_list), 3)]
        pages = []

        for index, chunk in enumerate(chunks):
            embed = discord.Embed(
                title="📜 Lista de Comandos" if index == 0 else "📜 Continuação",
                description="Aqui estão todos os comandos disponíveis:",
                color=discord.Color.blue()
            )
            embed.set_thumbnail(url="https://ibb.co/FkpsfHgG")
            embed.set_footer(text=f"Página {index + 1} de {len(chunks)}")
            embed.timestamp = discord.utils.utcnow()

            for cmd in chunk:
                exemplos = "\n".join([f"`{ex}`" for ex in cmd['examples']])
                embed.add_field(
                    name=f"**{cmd['name']}**",
                    value=f"{cmd['description']}\n**Sintaxe:** ```{cmd['syntax']}```\n**Exemplos:**\n{exemplos}",
                    inline=False
                )

            pages.append(embed)
        return pages

    @commands.hybrid_command(name="help", description="Mostra a lista de comandos disponíveis")
    async def help_slash(self, ctx):
        try:
            path = Path("commands/commands.json")
            if not path.is_file():
                return await ctx.reply(embed=discord.Embed(title="Erro", description="Arquivo não encontrado.", color=discord.Color.red()), ephemeral=True)

            with open(path, "r", encoding="utf-8") as f:
                cmds = json.load(f)

            pages = self.create_pages(cmds)
            view = PaginatorView(pages, ctx.author)
            await ctx.reply(embed=pages[0], view=view, ephemeral=True)

        except Exception as e:
            await ctx.reply(embed=discord.Embed(title="Erro", description=f"{e}", color=discord.Color.red()), ephemeral=True)

async def setup(bot):
    await bot.add_cog(Help(bot))
