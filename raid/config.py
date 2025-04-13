import os
from dotenv import load_dotenv

load_dotenv()  # Carrega as variáveis do .env

TOKEN = os.getenv("TOKEN")  # Token do bot
BOT_ID = os.getenv("BOT_ID")  # ID do bot
WEBHOOK_URL = os.getenv("WEBHOOK_URL")  # URL do Webhook
