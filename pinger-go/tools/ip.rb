require 'net/http'
require 'json'

def clear
  system("clear") || system("cls")
end

def ascii
  puts <<~ASCII
    \e[31m
     ██████╗ ███████╗ ██████╗  ██████╗ ██╗██████╗ 
    ██╔═══██╗██╔════╝██╔════╝ ██╔═══██╗██║██╔══██╗
    ██║   ██║█████╗  ██║  ███╗██║   ██║██║██████╔╝
    ██║   ██║██╔══╝  ██║   ██║██║   ██║██║██╔═══╝ 
    ╚██████╔╝███████╗╚██████╔╝╚██████╔╝██║██║     
     ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝     
          \e[33mPAKISTAN HUNTERS IP SCANNER\e[0m
  ASCII
end

def cor(texto, cor)
  cores = {
    vermelho: "\e[31m", verde: "\e[32m", amarelo: "\e[33m",
    azul: "\e[34m", magenta: "\e[35m", ciano: "\e[36m",
    branco: "\e[37m", reset: "\e[0m"
  }
  "#{cores[cor]}#{texto}#{cores[:reset]}"
end

def consultar_geoip(ip)
  url = URI("http://ip-api.com/json/#{ip}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query")
  resposta = Net::HTTP.get(url)
  dados = JSON.parse(resposta)

  if dados["status"] == "fail"
    puts cor("erro: #{dados['message']}", :vermelho)
    return
  end

  puts cor("\n========= INFO DO IP =========", :magenta)
  puts "#{cor('IP: ', :ciano)}#{dados['query']}"
  puts "#{cor('País: ', :ciano)}#{dados['country']}"
  puts "#{cor('Região: ', :ciano)}#{dados['regionName']}"
  puts "#{cor('Cidade: ', :ciano)}#{dados['city']}"
  puts "#{cor('CEP: ', :ciano)}#{dados['zip']}"
  puts "#{cor('Latitude: ', :ciano)}#{dados['lat']}"
  puts "#{cor('Longitude: ', :ciano)}#{dados['lon']}"
  puts "#{cor('Fuso horário: ', :ciano)}#{dados['timezone']}"
  puts "#{cor('ISP: ', :ciano)}#{dados['isp']}"
  puts "#{cor('Org: ', :ciano)}#{dados['org']}"
  puts "#{cor('AS: ', :ciano)}#{dados['as']}"
  puts cor("================================", :magenta)
end

# início do programa
clear
ascii
print cor("digita o ip pra puxar os bagulho: ", :verde)
ip = gets.chomp
consultar_geoip(ip)
