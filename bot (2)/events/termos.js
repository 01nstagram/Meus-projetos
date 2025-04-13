const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs')


module.exports = {
    name: 'sugestion',
    async execute(interaction) {

        if (interaction.isButton()) {
            if (interaction.customId === "mix") {
    
                interaction.reply({
                    content:`Olá <@${interaction.user.id}>, aqui estão as nossas tabelas de preço`,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle("Tabela - mix")
                        .setDescription(`__(Todas acompanham dados reais do titular)__\n💳 01 MIX - R$25\n💳 05 MIX - R$125\n💳 10 MIX - R$225\n**Mais quantidades consultar privado.**\n\n✅ Material VIRGEM.\n✅ Material com garantia de live e débito.\n✅ Material de altissima qualidade.\n✅ Material direto do admin de hotel.\n✅ Excelência em atendimento e agilidade na entrega do material e trocas.\n✅ Dados REAIS inclusos.\n✅ Trocas Em até 10 Minutos.`)
                    ],
                    ephemeral: true
                })
    
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === "regras") {
    
                interaction.reply({
                    content:`Olá <@${interaction.user.id}>, aqui estão as nossas regras`,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle("Termos - regras")
                        .setDescription(`Não nos responsabilizamos mais pelo produtos depois da entrega, caso tenha danificações depois de 10 minutos não haverá reembolso\n\nNão faça compra com terceiros dentro da LP System, pois qualquer compra fora do nosso servidor não será problema nosso.\nDivulgação: Dentro da LPBSystem não é aceito a divulgação, vendas , trocas ou etc…\nao adquirir um produto conosco, você estará automaticamente concordando com os termos.`)
                    ],
                    ephemeral: true
                })
    
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === "reembolso") {
    
                interaction.reply({
                    content:`Olá <@${interaction.user.id}>, aqui estão os nossos termos sobre reembolso`,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle("Termos - reembolso")
                        .setDescription(`Reembolso: Após a entrega de um produto , não aceitamos a devolução. Que nem o senhor sirigueijo dizia , reembolso é crime.`)
                    ],
                    ephemeral: true
                })
    
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === "prazo") {
    
                interaction.reply({
                    content:`Olá <@${interaction.user.id}>, aqui estão os nossos termos sobre o prazo`,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle("Termos - prazo")
                        .setDescription(`APÓS EFETUAR O PAGAMENTO, VOCÊ TEM O PRAZO DE ENTREGA DE 60 MINUTOS PARA RECEBER O SEU DEVIDO PRODUTO, CASO ACONTEÇA DE PASSAR O PRAZO E VOCÊ AINDA NÃO TIVER RECEBIDO O SEU PRODUTO, PODERÁ PEDIR REEMBOLSO.`)
                    ],
                    ephemeral: true
                })
    
            }
        }
    }

}