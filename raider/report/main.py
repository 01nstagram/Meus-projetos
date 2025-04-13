import json
import threading
import time
import requests

API_URL = 'https://discordapp.com/api/v10/report'
HEADERS = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'sv-SE',
    'User-Agent': 'Discord/21295 CFNetwork/1128.0.1 Darwin/19.6.0',
    'Content-Type': 'application/json'
}

REASON_CODES = {
    '1': 0, 'ILLEGAL CONTENT': 0,
    '2': 1, 'HARASSMENT': 1,
    '3': 2, 'SPAM OR PHISHING LINKS': 2,
    '4': 3, 'SELF-HARM': 3,
    '5': 4, 'NSFW CONTENT': 4
}

RESPONSE_MESSAGES = {
    401: "Invalid Discord token.",
    403: "Missing access to channel or guild.",
    422: "Action requires account verification."
}

class DiscordReporter:
    def __init__(self):
        self.sent_reports = 0
        self.errors = 0
        self.stop = False
        self.token = self.request_token()
        self.guild_id, self.channel_id, self.message_id, self.reason_code = self.collect_input()

    def request_token(self):
        return input("Token: ").strip()

    def collect_input(self):
        guild_id = input("Guild ID: ").strip()
        channel_id = input("Channel ID: ").strip()
        message_id = input("Message ID: ").strip()
        reason_code = self.select_reason()
        return guild_id, channel_id, message_id, reason_code

    def select_reason(self):
        print("\n1 - Illegal content")
        print("2 - Harassment")
        print("3 - Spam or phishing links")
        print("4 - Self-harm")
        print("5 - NSFW content")
        reason = input("Reason: ").strip().upper()
        return REASON_CODES.get(reason, None)

    def report(self):
        if self.reason_code is None:
            print("Invalid reason.")
            return
        
        data = {
            'channel_id': self.channel_id,
            'message_id': self.message_id,
            'guild_id': self.guild_id,
            'reason': self.reason_code
        }
        headers = HEADERS.copy()
        headers['Authorization'] = self.token
        
        response = requests.post(API_URL, json=data, headers=headers)
        self.handle_response(response)

    def handle_response(self, response):
        status = response.status_code
        if status == 201:
            self.sent_reports += 1
            print("Report sent successfully.")
        elif status == 429:
            retry_after = 2 + (time.time() % 4)
            print(f"Rate limit hit. Pausing for {retry_after:.1f} seconds...")
            time.sleep(retry_after)
        else:
            self.errors += 1
            error_message = RESPONSE_MESSAGES.get(status, f"Error: {response.text} (Status {status})")
            print(error_message)

    def update_status(self):
        while not self.stop:
            print(f"Sent: {self.sent_reports} | Errors: {self.errors}", end="\r", flush=True)
            time.sleep(0.1)

    def multi_threading(self):
        threading.Thread(target=self.update_status, daemon=True).start()
        try:
            threads = []
            while not self.stop:
                if len(threads) < 300:
                    thread = threading.Thread(target=self.report)
                    thread.start()
                    threads.append(thread)
                
                for t in threads:
                    if not t.is_alive():
                        threads.remove(t)
        except KeyboardInterrupt:
            self.stop = True
            print("\nStopping threads...")

    def run(self):
        self.multi_threading()

if __name__ == "__main__":
    reporter = DiscordReporter()
    reporter.run()
