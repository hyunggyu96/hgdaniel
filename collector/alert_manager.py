import requests
import os
import json

def send_slack_alert(title, impact, link, summary):
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        print("⚠️ SLACK_WEBHOOK_URL not found in environment.")
        return False
    
    # Impact emoji mapping
    emoji = "🔥" if impact >= 5 else "🔔"
    
    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"{emoji} High Impact News Detected!",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Title:* {title}\n*Impact Level:* {impact}/5\n*Summary:* {summary}"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Read Original",
                            "emoji": True
                        },
                        "url": link,
                        "action_id": "button-action"
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(
            webhook_url, 
            data=json.dumps(payload),
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == 200:
            print("🚀 Slack alert sent successfully!")
            return True
        else:
            print(f"❌ Slack alert failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error sending Slack alert: {e}")
        return False

def send_discord_alert(title, impact, link, summary):
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        print("⚠️ DISCORD_WEBHOOK_URL not found in environment.")
        return False
        
    color = 0xFF0000 if impact >= 5 else 0xFFA500
    
    payload = {
        "embeds": [
            {
                "title": f"🚀 High Impact News: {title}",
                "description": summary,
                "url": link,
                "color": color,
                "fields": [
                    {
                        "name": "Impact Level",
                        "value": f"{impact}/5",
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "Aesthetics Intelligence System"
                }
            }
        ]
    }
    
    try:
        response = requests.post(
            webhook_url, 
            json=payload
        )
        if response.status_code in [200, 204]:
            print("🚀 Discord alert sent successfully!")
            return True
        else:
            print(f"❌ Discord alert failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error sending Discord alert: {e}")
        return False
