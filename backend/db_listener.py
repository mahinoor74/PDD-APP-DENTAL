import psycopg2
import select
from plyer import notification
import json

DB_PASSWORD = "Mahinoor@2005"

def listen_to_pgadmin():
    conn = psycopg2.connect(
        host="localhost",
        database="toothmate_db",
        user="postgres",
        password=DB_PASSWORD,
        port="5432"
    )
    conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    cursor.execute("LISTEN brush_reminder;")
    print("🔔 Database Listener Synced. Waiting for pgAdmin 4 commits...")

    while True:
        if select.select([conn], [], [], 5) != ([], [], []):
            conn.poll()
            while conn.notifies:
                notify = conn.notifies.pop(0)
                try:
                    # Parse the comprehensive JSON packet sent from the SQL trigger
                    payload_data = json.loads(notify.payload)
                    user_name = payload_data.get("name", "User").capitalize()
                    user_email = payload_data.get("email", "")
                    m_time = payload_data.get("morning_time", "Not Set")
                    n_time = payload_data.get("night_time", "Not Set")
                    
                    # 🚀 TRIGGER DETAILED OPERATING SYSTEM BANNER
                    notification.notify(
                        title=f"🦷 ToothMate Reminder: {user_name}!",
                        message=f"Email: {user_email}\nSchedules Updated -> Morning: {m_time} | Night: {n_time}",
                        app_name="ToothMate Core",
                        timeout=12
                    )
                    print(f"🎯 POP-UP DISPATCHED: Handled live transaction for {user_name} ({user_email})")
                except Exception as parse_err:
                    print(f"Could not trigger popup: {parse_err}")

if __name__ == "__main__":
    listen_to_pgadmin()
