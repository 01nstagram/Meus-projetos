import requests
import threading
import os
import ctypes
from colorama import Fore, Style
from time import sleep

sent = 0
b = Style.BRIGHT
os.system('cls' if os.name == 'nt' else 'clear')

def load_tokens():
    with open("tokens.txt", "r") as f:
        return [line.strip() for line in f if line.strip()]

tokens = load_tokens()
if not tokens:
    print(f"{Fore.RED} > Nenhum token encontrado em tokens.txt")
    exit()

print(f"\n{b+Fore.GREEN} [PAKISTAN MASS REPORT]\n")
print(f"{b+Fore.RED} 1 > {Fore.RESET}Illegal Content\n" 
      f"{b+Fore.RED} 2 > {Fore.RESET}Harassment\n" 
      f"{b+Fore.RED} 3 > {Fore.RESET}Spam/Phishing Links\n" 
      f"{b+Fore.RED} 4 > {Fore.RESET}Self Harm\n" 
      f"{b+Fore.RED} 5 > {Fore.RESET}NSFW Content\n")

guild_id = input(f"{b+Fore.BLUE} > Server ID{Fore.RESET}: ")
channel_id = input(f"{b+Fore.BLUE} > Channel ID{Fore.RESET}: ")
message_id = input(f"{b+Fore.BLUE} > Message ID{Fore.RESET}: ")
reason = input(f"{b+Fore.BLUE} > Option{Fore.RESET}: ")

def report_message(token):
    global sent
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    payload = {
        'channel_id': channel_id,
        'guild_id': guild_id,
        'message_id': message_id,
        'reason': reason
    }
    try:
        r = requests.post('https://discord.com/api/v10/report', headers=headers, json=payload)
        if r.status_code == 201:
            sent += 1
            print(f"{Fore.GREEN} > Report enviado {b+Fore.BLUE}::{Fore.GREEN} ID {message_id}")
            os.system(f'echo -ne "\033]0;[PAKISTAN MASS REPORT] Enviados: {sent}\007"')
        elif r.status_code == 401:
            print(f"{Fore.RED} > Token inválido: {token[:10]}...")
        else:
            print(f"{Fore.RED} > Erro ao enviar report: {r.status_code}")
    except Exception as e:
        print(f"{Fore.RED} > Erro: {e}")

def start_reporting():
    while True:
        for token in tokens:
            threading.Thread(target=report_message, args=(token,)).start()
            sleep(0.5)

start_reporting()
