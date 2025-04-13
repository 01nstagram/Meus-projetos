import discord class HelpMenu(discord.ui.Select): def __init__(self): 
        options = [
            discord.SelectOption(label="Utilidades", value="util"), 
            discord.SelectOption(label="Diversão", value="diversao"), 
            discord.SelectOption(label="Staff", value="staff"), 
            discord.SelectOption(label="AutoMod", value="automod"), 
            discord.SelectOption(label="Owner", value="owner"),
        ] super().__init__( placeholder="Escolhe uma categoria", 
            options=options, custom_id="menu_help"
        ) async def callback(self, interaction: discord.Interaction): 
        categoria = self.values[0] embed = 
        discord.Embed(color=discord.Color.cyan()) if categoria == "util":
            embed.title = "Comandos de Utilidades" embed.description = 
            "`/ping`, `/userinfo`, `/serverinfo`, `/avatar`"
        elif categoria == "diversao": embed.title = "Comandos de Diversão" 
            embed.description = "`/gay`, `/beijar`, `/piada`, `/ship`, 
            `/coinflip`"
        elif categoria == "staff": embed.title = "Comandos de Staff" 
            embed.description = "`/ban`, `/kick`, `/mute`, `/warn`, 
            `/clear`"
        elif categoria == "automod": embed.title = "Comandos de AutoMod" 
            embed.description = "`/antilink`, `/antiinvite`, `/capslock`"
        elif categoria == "owner": embed.title = "Comandos de Dono" 
            embed.description = "`/eval`, `/reload`, `/setstatus`"
        else: embed.title = "Erro" embed.description = "Categoria inválida 
            mano"
        await interaction.response.edit_message(embed=embed, view=None) 
class HelpMenuView(discord.ui.View):
    def __init__(self): super().__init__(timeout=None)
        self.add_item(HelpMenu())
