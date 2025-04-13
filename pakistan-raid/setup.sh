#!/bin/bash

# cor vermelha
RED='\033[0;31m'
NC='\033[0m' # reset

clear
echo -e "${RED}[+] Instalando os requerimentos...${NC}"
pip install -r requirements.txt

sleep 2
clear

echo -e "${RED}"
echo "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⣴⣶⣿⣿⣿⣷⣶⣦⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀"
echo "⠀⠀⠀⠀⠀⠀⠀⣠⣴⣿⣿⣿⡿⠛⠉⠉⠀⠀⠀⠀⠉⠙⠛⠻⢿⣷⣦⣄⠀⠀⠀⠀"
echo "⠀⠀⠀⠀⠀⢀⣼⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣷⣦⡀⠀"
echo "⠀⠀⠀⠀⠀⣼⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣷⡀"
echo "⠀⠀⠀⠀⠀⣿⣿⣿⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇"
echo "⠀⠀⠀⠀⠀⠸⣿⣿⣧⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⠃"
echo "⠀⠀⠀⠀⠀⠀⠛⢿⣿⣷⣄⠀⠈⠉⠛⠛⠉⠉⠁⠀⠀⠀⠀⠀⠀⣠⣾⣿⡿⠋⠀⠀"
echo "⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⢿⣿⣷⣶⣤⣤⣤⣶⣾⣿⣿⣶⣶⠾⠛⠋⠉⠀⠀⠀⠀⠀"
echo "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⢿⣿⣿⠿⠿⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
echo ""
echo "      SCRIPT BY: 1NSTAGRAM (PAKISTAN HUNTERS)      "
echo -e "${NC}"

while true; do
    echo -e "${RED}Escolhe uma das opções aí doidão:${NC}"
    echo -e "${RED}1.${NC} Iniciar o bot"
    echo -e "${RED}2.${NC} Sair"
    echo -e "${RED}3.${NC} About me"
    read -p ">>> " op

    case $op in
        1)
            echo -e "${RED}[+] Iniciando o bot...${NC}"
            python3 head.py
            break
            ;;
        2)
            echo -e "${RED}[+] Sai fora então pae${NC}"
            exit 0
            ;;
        3)
            echo -e "${RED}"
            echo "Scripter: 1nstagram"
            echo "Team: Pakistan Hunters"
            echo "Discord: discord.gg/parkistan"
            echo "GitHub: github.com/1nstagram"
            echo -e "${NC}"
            ;;
        *)
            echo -e "${RED}tu ta fumando oq? opção inválida kkkk${NC}"
            ;;
    esac
done
