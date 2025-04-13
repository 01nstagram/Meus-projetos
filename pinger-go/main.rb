# main.rb com cores psicodélicas do demônio

def cor(texto, cor)
  cores = {
    vermelho: "\e[31m", verde: "\e[32m", amarelo: "\e[33m",
    azul: "\e[34m", magenta: "\e[35m", ciano: "\e[36m",
    branco: "\e[37m", reset: "\e[0m"
  }
  "#{cores[cor]}#{texto}#{cores[:reset]}"
end

def banner
  puts cor <<~BANNER, :vermelho

     ██████╗  █████╗ ██╗  ██╗██╗███████╗ █████╗ ███╗   ██╗
     ██╔══██╗██╔══██╗██║ ██╔╝██║╚══███╔╝██╔══██╗████╗  ██║
     ██████╔╝███████║█████╔╝ ██║  ███╔╝ ███████║██╔██╗ ██║
     ██╔═══╝ ██╔══██║██╔═██╗ ██║ ███╔╝  ██╔══██║██║╚██╗██║
     ██║     ██║  ██║██║  ██╗██║███████╗██║  ██║██║ ╚████║
     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝

         #{cor('ESCOLHE UMA DESGRAÇA PRA RODAR:', :amarelo)}

  BANNER
end

def listar_tools
  Dir.entries("tools").select { |f| f.end_with?(".rb") }
end

def exibir_menu(tools)
  tools.each_with_index do |tool, index|
    nome = File.basename(tool, ".rb")
    puts "   #{cor("[#{index + 1}]", :ciano)} #{cor(nome, :branco)}"
  end
end

def executar_tool(tool)
  puts "\n#{cor("Executando o demônio:", :magenta)} #{cor(tool.gsub('.rb', ''), :vermelho)}"
  system("ruby tools/#{tool}")
end

Dir.mkdir("tools") unless Dir.exist?("tools")

loop do
  system("clear") || system("cls")
  banner
  tools = listar_tools

  if tools.empty?
    puts cor("\nNenhuma tool encontrada na pasta 'tools', seu inútil!", :vermelho)
    break
  end

  exibir_menu(tools)

  print cor("\nEscolhe o número: ", :verde)
  escolha = gets.to_i

  if escolha.between?(1, tools.length)
    executar_tool(tools[escolha - 1])
    puts cor("\nFinalizou o bagulho... Pressiona ENTER pra voltar", :amarelo)
    gets
  else
    puts cor("\nOpção inválida, seu animal!", :vermelho)
    sleep(1.5)
  end
end
