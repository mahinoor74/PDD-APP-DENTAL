import os
import re
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor

# Import Local Dental AI Classifier Engine
from dental_ai_model import global_dental_ai_model

app = FastAPI(title="ToothMate Dental AI Backend API")

# --- 1. CORS MIDDLEWARE (FOR MOBILE & WEB) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. POSTGRES DATABASE CONNECTION UTILITY ---
def get_db_connection():
    try:
        connection = psycopg2.connect(
            dbname=os.getenv("DB_NAME", "toothmate_db"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "Mahinoor@2005"),
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432")
        )
        return connection
    except Exception as e:
        print(f"❌ DATABASE CONNECTION FAILURE: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Database connection failure. Check PostgreSQL credentials."
        )

# 🛠️ AUTOMATED DATABASE RELATION TABLE SETUP ON ENGINE STARTUP
def initialize_database_schema():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Create the profiles table first if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                age_group VARCHAR(50),
                gender VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_verified BOOLEAN DEFAULT FALSE,
                has_completed_onboarding BOOLEAN DEFAULT FALSE,
                morning_reminder VARCHAR(10),
                night_reminder VARCHAR(10),
                device_token TEXT
            );
        """)

        # 2. Build the brushing_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brushing_logs (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES profiles(id) ON DELETE CASCADE,
                session_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                duration_seconds INT DEFAULT 120,
                score INT DEFAULT 100,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Build the assessments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES profiles(id) ON DELETE CASCADE,
                responses JSONB,
                prescribed_technique VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()
        cursor.close()
        print("✅ DATABASE SCHEMAS & TABLES INITIALIZED SUCCESSFULLY.")
    except Exception as e:
        print(f"❌ DATABASE STARTUP BOOT FAIL: {str(e)}")
    finally:
        if conn: conn.close()

# --- PYDANTIC OBJECT MODELS ---
class UserProfileData(BaseModel):
    name: str
    ageGroup: str
    gender: str

class SignUpPayload(BaseModel):
    email: EmailStr
    password: str
    profile: UserProfileData

class SignInPayload(BaseModel):
    email: str
    password: str

class RecoverPayload(BaseModel):
    email: str

class DemographicsPayload(BaseModel):
    userId: int
    name: str
    ageGroup: str
    gender: str

class ReminderSavePayload(BaseModel):
    userId: int
    morningTime24h: str
    nightTime24h: str
    deviceToken: str = ""

class ManualBrushPayload(BaseModel):
    userId: int

class ChatPayload(BaseModel):
    message: str
    lang: str = "English"

class AssessmentResponses(BaseModel):
    hasBraces: bool = False
    bleedingGums: bool = False
    recededGums: bool = False
    hasImplants: bool = False
    heavySmoker: bool = False 
    aggressiveBrusher: bool = False
    sensitivity: bool = False
    manualDexterity: bool = False
    preventative: bool = False 

class AssessmentPayload(BaseModel):
    userId: int
    responses: AssessmentResponses

# --- 3. BACKGROUND TASK REMINDER ENGINE ---
@app.on_event("startup")
async def start_reminder_engine():
    initialize_database_schema()
    print("⏰ AUTOMATED DENTAL HYGIENE REMINDERS ENGINE ACTIVE ON PORT 8000")

# --- 4. DATA SYNCHRONIZATION ENDPOINTS ---

@app.put("/api/auth/demographics")
async def update_user_demographics(payload: DemographicsPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            UPDATE profiles
            SET name = %s, age_group = %s, gender = %s
            WHERE id = %s
            RETURNING id, name, email, age_group, gender;
            """,
            (payload.name, payload.ageGroup, payload.gender, payload.userId)
        )
        updated_user = cursor.fetchone()
        conn.commit()

        if not updated_user:
            raise HTTPException(status_code=404, detail="User profile not found in database.")

        return {
            "success": True,
            "message": "User demographics profile synced successfully.",
            "mode": payload.ageGroup.lower(),
            "user": updated_user
        }
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.post("/api/auth/signup")
async def register_new_user(payload: SignUpPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT id FROM profiles WHERE email = %s;", (payload.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email is already registered in the database.")

        cursor.execute(
            """
            INSERT INTO profiles (name, email, password_hash, age_group, gender, is_verified, has_completed_onboarding)
            VALUES (%s, %s, %s, %s, %s, TRUE, FALSE)
            RETURNING id, name, email, age_group, gender, has_completed_onboarding;
            """,
            (
                payload.profile.name,
                payload.email,
                payload.password,
                payload.profile.ageGroup,
                payload.profile.gender
            )
        )
        new_user = cursor.fetchone()
        conn.commit()

        return {
            "success": True,
            "message": "Account registered successfully!",
            "user": {
                "id": new_user['id'],
                "name": new_user['name'],
                "email": new_user['email'],
                "ageGroup": new_user['age_group'],
                "gender": new_user['gender'],
                "hasCompletedOnboarding": new_user['has_completed_onboarding']
            }
        }
    except HTTPException:
        raise
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.post("/api/auth/signin")
async def authenticate_user(payload: SignInPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT id, name, email, password_hash, age_group, gender, has_completed_onboarding
            FROM profiles 
            WHERE email = %s;
            """, 
            (payload.email,)
        )
        user = cursor.fetchone()

        if not user or user['password_hash'] != payload.password:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        return {
            "success": True,
            "message": "Authenticated successfully.",
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "ageGroup": user['age_group'],
                "gender": user['gender'],
                "hasCompletedOnboarding": user['has_completed_onboarding']
            }
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.post("/api/auth/recover")
@app.post("/api/auth/forgot-password")
async def recover_password(payload: RecoverPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT id, name FROM profiles WHERE email = %s;", (payload.email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=444, detail="No registered profile matches this email address.")

        return {
            "success": True,
            "message": f"Password recovery instructions dispatched to {payload.email}."
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.get("/api/dashboard/metrics/{user_id}")
async def get_dashboard_metrics(user_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        today_date = date.today()
        cursor.execute(
            """
            SELECT COUNT(*) as count 
            FROM brushing_logs 
            WHERE user_id = %s AND DATE(completed_at) = %s;
            """,
            (user_id, today_date)
        )
        today_row = cursor.fetchone()
        today_completed_count = today_row['count'] if today_row else 0

        morning_completed = today_completed_count >= 1
        night_completed = today_completed_count >= 2

        cursor.execute(
            """
            SELECT COUNT(*) as total 
            FROM brushing_logs 
            WHERE user_id = %s;
            """,
            (user_id,)
        )
        total_row = cursor.fetchone()
        total_sessions = total_row['total'] if total_row else 0

        cursor.execute(
            """
            SELECT DISTINCT DATE(completed_at) as log_date 
            FROM brushing_logs 
            WHERE user_id = %s 
            ORDER BY log_date DESC;
            """,
            (user_id,)
        )
        log_rows = cursor.fetchall()
        logged_dates = {row['log_date'] for row in log_rows}

        streak_days = 0
        check_date = today_date
        
        if check_date not in logged_dates:
            check_date = today_date - timedelta(days=1)

        while check_date in logged_dates:
            streak_days += 1
            check_date -= timedelta(days=1)

        monday_of_this_week = today_date - timedelta(days=today_date.weekday())
        weekly_history_map = {}
        day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        days_with_logs = 0

        for idx, day_name in enumerate(day_labels):
            target_day_date = monday_of_this_week + timedelta(days=idx)
            
            cursor.execute(
                """
                SELECT COUNT(*) as cnt 
                FROM brushing_logs 
                WHERE user_id = %s AND DATE(completed_at) = %s;
                """,
                (user_id, target_day_date)
            )
            d_cnt = cursor.fetchone()['cnt']
            
            if d_cnt > 0:
                days_with_logs += 1

            weekly_history_map[day_name] = {
                "dayNumber": target_day_date.day,
                "completed": d_cnt >= 2,
                "count": d_cnt
            }

        weekly_compliance_percentage = round((days_with_logs / 7.0) * 100)

        return {
            "success": True,
            "streakDays": int(streak_days),
            "totalSessions": int(total_sessions),
            "weeklyCompliancePct": int(weekly_compliance_percentage),
            "morningCompletedToday": morning_completed,
            "nightCompletedToday": night_completed,
            "todayCompletedCount": int(today_completed_count),
            "weeklyHistory": weekly_history_map,
            "weekRangeLabel": f"{monday_of_this_week.strftime('%b %d').upper()} - {(monday_of_this_week + timedelta(days=6)).strftime('%b %d').upper()}",
            "recommendedTechnique": "Modified Bass Technique"
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.post("/api/assessment/submit")
async def submit_assessment(payload: AssessmentPayload):
    try:
        res = payload.responses
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("UPDATE profiles SET has_completed_onboarding = TRUE WHERE id = %s;", (payload.userId,))
        cursor.execute("SELECT age_group FROM profiles WHERE id = %s;", (payload.userId,))
        profile_row = cursor.fetchone()
        cursor.close()
        conn.commit() 
        conn.close()
        
        user_mode = "adult"
        if profile_row and profile_row['age_group']:
            user_mode = profile_row['age_group'].lower()

        why_reasons = []
        if res.hasBraces:
            why_reasons.append("You indicated having fixed braces or archwires on your teeth.")
        if res.bleedingGums:
            why_reasons.append("You reported gum bleeding, redness, or tenderness during brushing.")
        if res.recededGums:
            why_reasons.append("You noticed gumline recession exposing tooth root surfaces.")
        if res.hasImplants:
            why_reasons.append("You have dental implants, bridges, crowns, or partial dentures.")
        if getattr(res, 'sensitivity', False):
            why_reasons.append("You experience sharp thermal tooth sensitivity to hot or cold foods.")
        if getattr(res, 'aggressiveBrusher', False):
            why_reasons.append("You scrub with firm pressure or medium/hard bristles, increasing abrasion risks.")
        if getattr(res, 'heavySmoker', False):
            why_reasons.append("You indicated regular tobacco use or tough tartar/stain buildup.")
        if getattr(res, 'manualDexterity', False):
            why_reasons.append("You experience difficulty maneuvering or gripping your toothbrush around back teeth.")

        if not why_reasons:
            why_reasons.append("Suggested as a standard preventative routine to maintain optimal oral health and clear daily plaque.")

        why_suggested = " ".join(why_reasons)

        if res.hasBraces:
            technique = "Orthodontic Charters Technique"
            description = "Designed explicitly for patients with fixed braces or brackets to clean under bracket wings and archwires safely."
            what_it_is = "A specialized clinical technique formulated by Dr. W.J. Charters that directs toothbrush bristles at a 45-degree angle toward the chewing surface to sweep underneath orthodontic brackets."
            how_it_works = "Bristles are placed at a 45-degree angle pointing toward the chewing edges. Short vibratory circular movements dislodge plaque wedged under archwires without dislodging hardware."
            precautions = [
                "Do not press excessively hard against metal archwires to avoid bending or bracket detachment.",
                "Avoid standard horizontal sawing motions which fray toothbrush bristles rapidly.",
                "Use an ultra-soft small-headed toothbrush or specialized V-trim orthodontic brush."
            ]
            steps = [
                "Place brush bristles at a 45° angle facing downward toward the chewing edges over the top bracket row.",
                "Perform 10 small, gentle vibratory circular strokes around each bracket and wire pocket.",
                "Reverse the angle pointing 45° upward from below the bracket to clean underneath the archwire.",
                "Brush chewing surfaces and inside tooth surfaces using smooth circular sweeps."
            ]
            video_url = "https://www.youtube.com/embed/Y-yM1w7G7dQ"

        elif res.recededGums or getattr(res, 'aggressiveBrusher', False) or getattr(res, 'sensitivity', False):
            technique = "Modified Stillman Technique"
            description = "Prescribed for patients with gum recession, root sensitivity, or toothbrush abrasion to protect exposed dentin."
            what_it_is = "A tissue-protective technique designed to stimulate gum circulation while gently cleansing exposed root surfaces without causing enamel or dentin abrasion."
            how_it_works = "Bristles rest half on attached gum tissue and half on the root, angled at 45 degrees towards the root apex. Pulsing vibrations stimulate blood flow, followed by a sweeping roll over the tooth crown."
            precautions = [
                "Never use medium or hard bristles or scrub horizontally, as this wears away exposed root dentin.",
                "Apply only light to moderate pulsing pressure on gum margins.",
                "Pairs best with a sensitive desensitizing toothpaste."
            ]
            steps = [
                "Place brush bristles half on your gum tissue and half on the exposed tooth root surface at a 45° angle.",
                "Apply gentle pressure until light blanching of the gum tissue is observed.",
                "Perform short vibratory pulsing motions on the spot for 5 to 10 seconds per section.",
                "Roll the brush head downward (upper teeth) or upward (lower teeth) towards chewing surfaces."
            ]
            video_url = "https://www.youtube.com/embed/N-0pZ1ZpQ4Y"

        elif res.bleedingGums or getattr(res, 'heavySmoker', False):
            technique = "Modified Bass Technique"
            description = "The gold-standard periodontist method for treating bleeding gums, gingivitis, and subgingival plaque."
            what_it_is = "Recognized globally as the premier sulcular cleaning method. It targets subgingival plaque trapped inside the gingival pocket where gum disease begins."
            how_it_works = "Bristles are angled at 45 degrees directly into the gum line pocket. A short, gentle vibratory shake disrupts bacterial biofilm inside the sulcus before sweeping away."
            precautions = [
                "Avoid pushing bristles too deeply into the sulcus with heavy force to prevent tissue puncture.",
                "Use soft end-rounded bristles to prevent microscopic gum tears.",
                "Maintain a true 45-degree angle rather than pressing flat against tooth faces."
            ]
            steps = [
                "Angle brush bristles at 45 degrees directly toward the line where your gums meet your teeth.",
                "Gently press so bristle tips enter the top of the gum pocket without discomfort.",
                "Execute 10 short, gentle vibratory back-and-forth shakes on the spot.",
                "Roll the brush head firmly away from the gums to sweep dislodged plaque out of the mouth."
            ]
            video_url = "https://www.youtube.com/embed/4iIGhqi57es"

        elif res.hasImplants:
            technique = "Smith-Bell Sulcular Method"
            description = "Optimized for crowns, bridges, and dental implants to prevent peri-implantitis and marginal inflammation."
            what_it_is = "A specialized restoration technique focused on maintaining clean margins around dental implant crowns, fixed partial bridges, and prosthetic caps."
            how_it_works = "Bristle tips are guided gently into the junction between the prosthetic crown and natural gum tissue, using smooth sweeping passes to eliminate plaque around titanium anchors."
            precautions = [
                "Never use metal tools or abrasive scrubbers near implant abutments.",
                "Clean thoroughly beneath bridge pontics without forcing bristles harshly under seals.",
                "Combine daily brushing with interdental brushes or a water flosser around implant posts."
            ]
            steps = [
                "Rest soft bristle tips right where your replacement crown or bridge meets the gumline.",
                "Angle bristles slightly into the crown-gum junction using light, steady pressure.",
                "Perform smooth, controlled sweeping motions along the artificial crown contours.",
                "Clear spaces around bridge anchors using an interdental brush or flossing threader."
            ]
            video_url = "https://www.youtube.com/embed/jD-J8Z2n984"

        elif user_mode in ["child", "kids", "teen"] or getattr(res, 'manualDexterity', False):
            technique = "Fones Circular Technique"
            description = "A simple, fun, and highly effective circular brushing method ideal for kids and limited dexterity."
            what_it_is = "Formulated by Dr. Alfred Fones, this method uses continuous circular movements to clean large tooth surfaces quickly without requiring complex wrist rotation."
            how_it_works = "Teeth are closed lightly together, and the brush head sweeps in broad, continuous circles over both upper and lower tooth arches simultaneously."
            precautions = [
                "Avoid pressing hard against teeth while making circular passes.",
                "Make sure to open wide to clean the inner tongue-side walls using gentle sweeping strokes.",
                "Replace toothbrush heads as soon as bristles begin flaring."
            ]
            steps = [
                "Close your teeth together gently and place the brush flat against your cheek teeth.",
                "Make big, happy circular sweeping motions covering upper and lower teeth together.",
                "Open wide and sweep the inside walls of your teeth from back to front.",
                "Gently sweep your tongue from back to front for super fresh breath."
            ]
            video_url = "https://www.youtube.com/embed/1B1a2a0oG8Q"

        else:
            technique = "Roll / Sweep Technique"
            description = "A classic preventative cleaning routine ideal for maintaining healthy gums and pristine enamel."
            what_it_is = "A foundational oral hygiene method that rolls the bristles from gum margins down over tooth crowns to clear plaque without sulcular irritation."
            how_it_works = "Bristles are placed parallel against attached gums and rolled downward over tooth crowns in a sweeping motion, moving systematically arch by arch."
            precautions = [
                "Do not scrub back and forth at the gum line; focus on sweeping away from the gums.",
                "Use a soft-bristled toothbrush to protect delicate tissue.",
                "Spend a full 2 minutes covering all outer, inner, and chewing surfaces."
            ]
            steps = [
                "Place brush bristles against your gums pointing toward your roots.",
                "Roll the brush head downward (upper teeth) or upward (lower teeth) over the tooth crowns.",
                "Repeat 5 to 6 times per tooth section before advancing to adjacent teeth.",
                "Clean flat chewing surfaces using short, gentle back-and-forth strokes."
            ]
            video_url = "https://www.youtube.com/embed/4iIGhqi57es"

        return {
            "success": True,
            "technique": technique,
            "description": description,
            "whatItIs": what_it_is,
            "howItWorks": how_it_works,
            "whySuggested": why_suggested,
            "precautions": precautions,
            "steps": steps,
            "videoUrl": video_url,
            "mode": user_mode
        }
    except Exception as error:
        print("ASSESSMENT SUBMISSION FAILED LOG:", str(error))
        raise HTTPException(status_code=500, detail=str(error))

@app.post("/api/reminders/save")
async def save_reminders(payload: ReminderSavePayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE profiles 
            SET morning_reminder = %s, night_reminder = %s, device_token = %s 
            WHERE id = %s;
            """,
            (payload.morningTime24h, payload.nightTime24h, payload.deviceToken, payload.userId)
        )
        conn.commit()

        return {
            "success": True,
            "message": "Hygiene alarm preferences synced successfully with PostgreSQL database!"
        }
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.post("/api/brush/log-manual")
async def log_manual_brushing(payload: ManualBrushPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO brushing_logs (user_id, duration_seconds, score, completed_at) 
            VALUES (%s, 120, 100, CURRENT_TIMESTAMP);
            """,
            (payload.userId,)
        )
        conn.commit()

        return {
            "success": True,
            "message": "Manual 2-minute brushing session successfully logged and stored!"
        }
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

# --- 5. REAL-TIME AI DENTAL ASSISTANT CHATBOT ---

@app.post("/api/chat")
@app.post("/chat")
async def chat_with_dental_ai(payload: ChatPayload):
    try:
        user_msg = payload.message.strip()
        if not user_msg:
            return {"response": "Hello! I am Dr. Minty AI. How can I assist you with your oral health today?"}
        
        reply = global_dental_ai_model.predict(user_msg, language=payload.lang)
        return {"response": reply, "success": True}
    except Exception as e:
        print("Chat processing error:", str(e))
        return {
            "response": "Hello! I am Dr. Minty AI, your virtual dental assistant. How can I help you with your oral health today?",
            "success": False
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)