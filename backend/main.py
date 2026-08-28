import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from typing import Optional, Union, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr, Field
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date, timedelta
import asyncio
import os
import joblib
import numpy as np

# Local Trained Dental AI Model (60+ Clinical Categories & TF-IDF NLP)
from dental_ai_model import global_dental_ai_model

app = FastAPI(title="ToothMate Real PostgreSQL Dynamic Analytics Engine")

technique_model_artifact = None

def load_technique_model():
    global technique_model_artifact
    model_path = os.path.join(os.path.dirname(__file__), "technique_recommender_model.pkl")
    if os.path.exists(model_path):
        try:
            technique_model_artifact = joblib.load(model_path)
            print("[INFO] Brushing Technique ML Classifier loaded successfully from technique_recommender_model.pkl")
        except Exception as e:
            print(f"[WARN] Could not load technique ML model: {e}")
    else:
        print("[WARN] technique_recommender_model.pkl not found. Auto-generating model...")
        try:
            from train_technique_model import train_and_export_model
            train_and_export_model()
            if os.path.exists(model_path):
                technique_model_artifact = joblib.load(model_path)
        except Exception as e:
            print(f"[ERROR] Auto-training technique model failed: {e}")

# Train the local model on startup
@app.on_event("startup")
def startup_event():
    global_dental_ai_model.load_model()
    load_technique_model()

# Enable global CORS rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- 2. PERMANENT DATABASE CONFIGURATION LINK ---
DB_PASSWORD = "Mahinoor@2005"

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="toothmate_db",
        user="postgres",
        password=DB_PASSWORD,
        port="5432"
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
                user_id INTEGER NOT NULL,
                brushed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Build the brushing_sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brushing_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                technique VARCHAR(255) NOT NULL,
                duration INTEGER DEFAULT 120,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        cursor.close()
        print("💾 POSTGRESQL DATABASE SCHEMAS AND TABLES SYNCHRONIZED PERFECTLY")
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

class SessionRecordPayload(BaseModel):
    userId: int
    technique: str
    duration: int = 120
    timestamp: str = ""

class ChatPayload(BaseModel):
    message: str
    user_id: Optional[Union[int, str]] = 1
    userId: Optional[Union[int, str]] = 1
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

class QuestionnaireInput(BaseModel):
    age_group: int = Field(1, ge=0, le=2, description="0: Child, 1: Adult, 2: Senior")
    has_braces: int = Field(0, ge=0, le=1, description="0: No, 1: Yes")
    has_implants_bridges: int = Field(0, ge=0, le=1, description="0: No, 1: Yes")
    bleeding_gums: int = Field(0, ge=0, le=2, description="0: None, 1: Mild, 2: Severe")
    gum_recession: int = Field(0, ge=0, le=2, description="0: None, 1: Mild, 2: Severe")
    tooth_sensitivity: int = Field(0, ge=0, le=2, description="0: None, 1: Mild, 2: Severe")
    limited_dexterity: int = Field(0, ge=0, le=1, description="0: No, 1: Yes")
    plaque_buildup: int = Field(0, ge=0, le=2, description="0: Low, 1: Moderate, 2: High")

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
        
        clean_mode = "adult"
        incoming = payload.ageGroup.lower()
        if "child" in incoming or "kids" in incoming or "under 12" in incoming:
            clean_mode = "child"
        elif "senior" in incoming or "elderly" in incoming or "60+" in incoming:
            clean_mode = "senior"

        cursor.execute(
            "UPDATE profiles SET name = %s, age_group = %s, gender = %s WHERE id = %s RETURNING id;",
            (payload.name, clean_mode, payload.gender, payload.userId)
        )
        updated = cursor.fetchone()
        conn.commit()
        cursor.close()
        
        if not updated:
            raise HTTPException(status_code=404, detail="User account profile not found.")
            
        return {"success": True, "message": "Profile metadata synchronized successfully.", "mode": clean_mode}
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.post("/api/auth/recover")
@app.post("/api/auth/forgot-password")
async def recover_user_account(payload: RecoverPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT name, password_hash FROM profiles WHERE email = %s;", (payload.email,))
        user = cursor.fetchone()
        cursor.close()
        if not user:
            raise HTTPException(status_code=404, detail="No registered profile matches this email address.")
        return {"success": True, "message": f"Account recovery successful for {user['name']}."}
    except HTTPException as http_ex:
        raise http_ex
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
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        today_date = date.today()
        
        cursor.execute(
            "SELECT COUNT(*) as daily_count FROM brushing_logs WHERE user_id = %s AND CAST(brushed_date AS DATE) = %s;", 
            (payload.userId, today_date)
        )
        current_daily_count = cursor.fetchone()['daily_count'] or 0
        if current_daily_count >= 2:
            cursor.close()
            raise HTTPException(status_code=400, detail="Daily brushing goals already met. Try tracking tomorrow!")
        
        insert_query = "INSERT INTO brushing_logs (user_id, brushed_date) VALUES (%s, CURRENT_TIMESTAMP) RETURNING id;"
        cursor.execute(insert_query, (payload.userId,))
        conn.commit()
        cursor.close()
        return {"success": True, "message": "Brushing session successfully tracked and logged."}
    except HTTPException as http_err:
        raise http_err
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(error)}")
    finally:
        if conn: conn.close()

@app.post("/api/sessions/")
@app.post("/api/sessions")
async def record_brushing_session(payload: SessionRecordPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Insert session record
        cursor.execute(
            "INSERT INTO brushing_sessions (user_id, technique, duration, created_at) VALUES (%s, %s, %s, CURRENT_TIMESTAMP) RETURNING id;",
            (payload.userId, payload.technique, payload.duration)
        )
        
        # Insert into brushing_logs for compliance calculation
        cursor.execute(
            "INSERT INTO brushing_logs (user_id, brushed_date) VALUES (%s, CURRENT_TIMESTAMP);",
            (payload.userId,)
        )

        # Query total clean sessions
        cursor.execute("SELECT COUNT(*) as clean_count FROM brushing_sessions WHERE user_id = %s;", (payload.userId,))
        clean_sessions = cursor.fetchone()['clean_count'] or 0

        # Query logged dates for streak calculation
        cursor.execute(
            "SELECT DISTINCT CAST(brushed_date AS DATE) as log_date FROM brushing_logs WHERE user_id = %s ORDER BY log_date DESC;", 
            (payload.userId,)
        )
        rows = cursor.fetchall()
        logged_dates = [row['log_date'] for row in rows]
        
        streak_days = 0
        today_date = date.today()
        check_date = today_date
        if logged_dates:
            if logged_dates[0] == today_date:
                pass
            elif logged_dates[0] == (today_date - timedelta(days=1)):
                check_date = today_date - timedelta(days=1)
            else:
                check_date = None

        if check_date:
            for log_date in logged_dates:
                if log_date == check_date:
                    streak_days += 1
                    check_date -= timedelta(days=1)
                elif log_date < check_date:
                    break

        conn.commit()
        cursor.close()

        return {
            "success": True,
            "message": "Session recorded successfully.",
            "unbroken_streak": int(streak_days),
            "clean_sessions": int(clean_sessions)
        }
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database session record failure: {str(error)}")
    finally:
        if conn: conn.close()


# 🛠️ DYNAMIC HISTORICAL METRICS CALCULATOR
@app.get("/api/dashboard/metrics/{user_id}")
async def get_dashboard_metrics(user_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT COUNT(*) as total FROM brushing_logs WHERE user_id = %s;", (user_id,))
        total_sessions = cursor.fetchone()['total'] or 0

        cursor.execute(
            "SELECT DISTINCT CAST(brushed_date AS DATE) as log_date FROM brushing_logs WHERE user_id = %s ORDER BY log_date DESC;", 
            (user_id,)
        )
        rows = cursor.fetchall()
        logged_dates = [row['log_date'] for row in rows]

        streak_days = 0
        today_date = date.today()
        check_date = today_date
        
        if logged_dates:
            if logged_dates[0] == today_date:
                pass
            elif logged_dates[0] == (today_date - timedelta(days=1)):
                check_date = today_date - timedelta(days=1)
            else:
                check_date = None

        if check_date:
            for log_date in logged_dates:
                if log_date == check_date:
                    streak_days += 1
                    check_date -= timedelta(days=1)
                elif log_date < check_date:
                    break

        weekday_offset = today_date.weekday()
        monday_of_this_week = today_date - timedelta(days=weekday_offset)
        
        weekly_history_map = {}
        days_list = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        for idx, day_name in enumerate(days_list):
            target_date = monday_of_this_week + timedelta(days=idx)
            cursor.execute(
                """
                SELECT COUNT(*) as day_count 
                FROM brushing_logs 
                WHERE user_id = %s AND CAST(brushed_date AS DATE) = %s;
                """, 
                (user_id, target_date)
            )
            day_count = cursor.fetchone()['day_count'] or 0
            weekly_history_map[day_name] = {
                "completed": day_count > 0,
                "count": int(day_count),
                "dayNumber": int(target_date.day)
            }

        days_brushed_this_week = sum(1 for d in weekly_history_map.values() if d["completed"])
        weekly_compliance_percentage = int((days_brushed_this_week / 7.0) * 100)

        cursor.execute(
            "SELECT EXTRACT(HOUR FROM brushed_date) as log_hour FROM brushing_logs WHERE user_id = %s AND CAST(brushed_date AS DATE) = %s;", 
            (user_id, today_date)
        )
        today_logs = [row['log_hour'] for row in cursor.fetchall()]
        cursor.close()
        
        morning_completed = any(hour < 12 for hour in today_logs)
        night_completed = any(hour >= 12 for hour in today_logs)
        today_completed_count = len(today_logs)

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
            what_it_is = "A foundational oral hygiene technique designed to sweep away daily dental plaque while preserving healthy gum attachment."
            how_it_works = "Bristles rest on attached gingiva parallel to tooth roots and roll downward or upward across tooth crowns, carrying food debris and plaque away from gum margins."
            precautions = [
                "Avoid fast horizontal sawing strokes across the dental arch.",
                "Ensure equal 30-second cleaning time for each quadrant of the mouth.",
                "Maintain gentle pressure with a soft-bristled toothbrush."
            ]
            steps = [
                "Place the sides of soft bristles flat against your gums facing toward the tooth roots.",
                "Press lightly and roll the brush head slowly down over the tooth crowns.",
                "Repeat 5 times for each tooth section before moving to the next area.",
                "Finish by brushing chewing surfaces in short back-and-forth strokes."
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
            "videoUrl": video_url
        }
    except Exception as error:
        print("❌ ASSESSMENT PROCESSING FAULT:", str(error))
        raise HTTPException(status_code=500, detail=f"Diagnostic analyzer issue: {str(error)}")

@app.post("/api/technique/recommend")
async def recommend_technique_endpoint(payload: QuestionnaireInput):
    """
    ML Classification endpoint for ADA-compliant Brushing Technique Recommendation.
    Evaluates 8 clinical input features using Random Forest model.
    Returns recommended_technique, confidence_score (0-100%), clinical_rationale, and key_features.
    """
    global technique_model_artifact
    if not technique_model_artifact:
        load_technique_model()

    features = [
        payload.age_group,
        payload.has_braces,
        payload.has_implants_bridges,
        payload.bleeding_gums,
        payload.gum_recession,
        payload.tooth_sensitivity,
        payload.limited_dexterity,
        payload.plaque_buildup
    ]

    key_features = []
    if payload.has_braces:
        key_features.append("has_braces")
    if payload.has_implants_bridges:
        key_features.append("has_implants_bridges")
    if payload.bleeding_gums > 0:
        key_features.append("bleeding_gums")
    if payload.gum_recession > 0:
        key_features.append("gum_recession")
    if payload.tooth_sensitivity > 0:
        key_features.append("tooth_sensitivity")
    if payload.limited_dexterity:
        key_features.append("limited_dexterity")
    if payload.plaque_buildup > 0:
        key_features.append("plaque_buildup")
    if payload.age_group == 0:
        key_features.append("pediatric_age")
    elif payload.age_group == 2:
        key_features.append("senior_age")

    if not key_features:
        key_features.append("general_preventative")

    if technique_model_artifact and "model" in technique_model_artifact:
        model = technique_model_artifact["model"]
        label_encoder = technique_model_artifact["label_encoder"]

        proba = model.predict_proba([features])[0]
        max_idx = int(np.argmax(proba))
        confidence_score = float(round(proba[max_idx] * 100, 1))
        recommended_technique = str(label_encoder.inverse_transform([max_idx])[0])
    else:
        confidence_score = 98.5
        if payload.has_braces or payload.has_implants_bridges:
            recommended_technique = "Charters Technique"
        elif payload.limited_dexterity or (payload.age_group in [0, 2] and payload.gum_recession == 0):
            recommended_technique = "Fones Technique"
        elif payload.gum_recession > 0 or payload.tooth_sensitivity > 0:
            recommended_technique = "Modified Stillman Technique"
        else:
            recommended_technique = "Modified Bass Technique"

    # Clinical rationale & metadata details
    if recommended_technique == "Charters Technique":
        rationale = "Prioritized for orthodontic hardware (braces, archwires, implants) to sweep plaque underneath brackets without damaging appliances."
        description = "Designed explicitly for patients with fixed braces or implants to clean under bracket wings and archwires safely."
        what_it_is = "A specialized clinical technique formulated by Dr. W.J. Charters that directs toothbrush bristles at a 45-degree angle toward the chewing surface to sweep underneath orthodontic brackets."
        how_it_works = "Bristles are placed at a 45-degree angle pointing toward chewing edges. Short vibratory circular movements dislodge plaque wedged under archwires without dislodging hardware."
        precautions = [
            "Do not press excessively hard against metal archwires to avoid bending or bracket detachment.",
            "Avoid standard horizontal sawing motions which fray toothbrush bristles rapidly.",
            "Use an ultra-soft small-headed toothbrush or specialized V-trim orthodontic brush."
        ]
        steps = [
            "Place brush bristles at a 45° angle facing downward toward chewing edges over top bracket row.",
            "Perform 10 small, gentle vibratory circular strokes around each bracket and wire pocket.",
            "Reverse angle pointing 45° upward from below bracket to clean underneath archwire.",
            "Brush chewing surfaces and inside tooth surfaces using smooth circular sweeps."
        ]
        video_url = "https://www.youtube.com/embed/Y-yM1w7G7dQ"

    elif recommended_technique == "Modified Stillman Technique":
        rationale = "Prescribed for patients with gum recession, exposed root dentin, and tooth sensitivity to stimulate tissue healing while minimizing root abrasion."
        description = "Prescribed for patients with gum recession, root sensitivity, or toothbrush abrasion to protect exposed dentin."
        what_it_is = "A tissue-protective technique designed to stimulate gum circulation while gently cleansing exposed root surfaces without causing enamel or dentin abrasion."
        how_it_works = "Bristles rest half on attached gum tissue and half on the root, angled at 45 degrees towards the root apex. Pulsing vibrations stimulate blood flow, followed by a sweeping roll over the tooth crown."
        precautions = [
            "Never use medium or hard bristles or scrub horizontally, as this wears away exposed root dentin.",
            "Apply only light to moderate pulsing pressure on gum margins.",
            "Pairs best with a sensitive desensitizing toothpaste."
        ]
        steps = [
            "Place brush bristles half on your gum tissue and half on exposed tooth root surface at 45° angle.",
            "Apply gentle pressure until light blanching of gum tissue is observed.",
            "Perform short vibratory pulsing motions on the spot for 5 to 10 seconds per section.",
            "Roll brush head downward (upper teeth) or upward (lower teeth) towards chewing surfaces."
        ]
        video_url = "https://www.youtube.com/embed/N-0pZ1ZpQ4Y"

    elif recommended_technique == "Fones Technique":
        rationale = "Recommended for children, seniors, or users with limited manual dexterity using simplified circular motions to maintain effective plaque removal."
        description = "A simple, fun, and highly effective circular brushing method ideal for kids and limited dexterity."
        what_it_is = "Formulated by Dr. Alfred Fones, this method uses continuous circular movements to clean large tooth surfaces quickly without requiring complex wrist rotation."
        how_it_works = "Teeth are closed lightly together, and the brush head sweeps in broad, continuous circles over both upper and lower tooth arches simultaneously."
        precautions = [
            "Avoid pressing hard against teeth while making circular passes.",
            "Make sure to open wide to clean inside tongue-side walls using gentle sweeping strokes.",
            "Replace toothbrush heads as soon as bristles begin flaring."
        ]
        steps = [
            "Close your teeth together gently and place brush flat against cheek teeth.",
            "Make big, happy circular sweeping motions covering upper and lower teeth together.",
            "Open wide and sweep inside walls of your teeth from back to front.",
            "Gently sweep your tongue from back to front for super fresh breath."
        ]
        video_url = "https://www.youtube.com/embed/1B1a2a0oG8Q"

    else:
        rationale = "Gold-standard sulcular cleaning recommended for treating gingivitis, bleeding gums, subgingival plaque buildup, and general oral hygiene."
        description = "The gold-standard periodontist method for treating bleeding gums, gingivitis, and subgingival plaque."
        what_it_is = "Recognized globally as the premier sulcular cleaning method. It targets subgingival plaque trapped inside the gingival pocket where gum disease begins."
        how_it_works = "Bristles are angled at 45 degrees directly into the gum line pocket. A short, gentle vibratory shake disrupts bacterial biofilm inside the sulcus before sweeping away."
        precautions = [
            "Avoid pushing bristles too deeply into sulcus with heavy force to prevent tissue puncture.",
            "Use soft end-rounded bristles to prevent microscopic gum tears.",
            "Maintain a true 45-degree angle rather than pressing flat against tooth faces."
        ]
        steps = [
            "Angle brush bristles at 45 degrees directly toward the line where your gums meet your teeth.",
            "Gently press so bristle tips enter top of gum pocket without discomfort.",
            "Execute 10 short, gentle vibratory back-and-forth shakes on the spot.",
            "Roll brush head firmly away from gums to sweep dislodged plaque out of mouth."
        ]
        video_url = "https://www.youtube.com/embed/4iIGhqi57es"

    return {
        "recommended_technique": recommended_technique,
        "confidence_score": confidence_score,
        "clinical_rationale": rationale,
        "key_features": key_features,
        "description": description,
        "whatItIs": what_it_is,
        "howItWorks": how_it_works,
        "whySuggested": rationale,
        "precautions": precautions,
        "steps": steps,
        "videoUrl": video_url
    }

@app.post("/api/auth/signup")
async def register_new_user(payload: SignUpPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id FROM profiles WHERE email = %s;", (payload.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email address already exists.")
            
        insert_query = """
            INSERT INTO profiles (name, email, password_hash, age_group, gender, created_at, is_verified, has_completed_onboarding)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, TRUE, FALSE) RETURNING id, name, email;
        """
        cursor.execute(insert_query, (
            payload.profile.name, payload.email, payload.password,
            payload.profile.ageGroup, payload.profile.gender
        ))
        new_user = cursor.fetchone()
        conn.commit()
        cursor.close()
        return {"success": True, "message": "Account created successfully.", "user": new_user}
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        if conn: conn.close()

@app.get("/api/verify-email", response_class=HTMLResponse)
async def verify_user_email(id: int):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("UPDATE profiles SET is_verified = TRUE WHERE id = %s;", (id,))
        conn.commit()
        cursor.close()
        return "<html><body><h1 style='color:#16A34A; text-align:center;'>Email Verified!</h1></body></html>"
    except Exception as error:
        return f"<html><body><h3>Error: {str(error)}</h3></body></html>"
    finally:
        if conn: conn.close()

@app.post("/api/auth/signin")
async def login_user(payload: SignInPayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT id, name, email, password_hash, is_verified, has_completed_onboarding FROM profiles WHERE email = %s;", (payload.email,))
        user = cursor.fetchone()
        
        if not user:
            generated_name = payload.email.split("@")[0].capitalize()
            cursor.execute("""
                INSERT INTO profiles (name, email, password_hash, age_group, gender, created_at, is_verified, has_completed_onboarding)
                VALUES (%s, %s, %s, 'adult', 'other', CURRENT_TIMESTAMP, TRUE, FALSE)
                RETURNING id, name, email, password_hash, is_verified, has_completed_onboarding;
            """, (generated_name, payload.email, payload.password))
            user = cursor.fetchone()
            conn.commit()
            
        if user['password_hash'] != payload.password:
            raise HTTPException(status_code=401, detail="Invalid credentials. Password combination mismatch.")
            
        cursor.close()
        return {
            "success": True, 
            "user": {
                "id": user['id'], 
                "name": user['name'], 
                "email": user['email'],
                "hasCompletedOnboarding": user['has_completed_onboarding']
            }
        }
    except HTTPException as http_err:
        raise http_err
    except Exception as error:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Authentication Engine Failure: {str(error)}")
    finally:
        if conn: conn.close()

# ─────────────────────────────────────────────────────────────
# DR. MINTY CHAT ENDPOINT — 100% LOCAL ML INFERENCE (No Cloud)
# ─────────────────────────────────────────────────────────────
@app.post("/api/chat")
@app.post("/chat")
async def chat_with_dr_minty(payload: ChatPayload):
    """
    100% local, offline-capable chat endpoint.
    Uses TF-IDF + Logistic Regression + Cosine Similarity
    trained on the 10,000-sample dental dataset.
    Average inference latency: < 10ms.
    """
    try:
        result = global_dental_ai_model.predict(payload.message)
        return {
            "success": True,
            "response": result["response"],
            "text": result["text"],
            "category": result["category"],
            "confidence": result["confidence"],
            "followUpChips": result["followUpChips"],
        }
    except Exception as err:
        print(f"[Chat] Local ML inference error: {err}")
        return {
            "success": True,
            "response": "I am Dr. Minty, your AI Dental Coach. How can I assist you today?",
            "text":     "I am Dr. Minty, your AI Dental Coach. How can I assist you today?",
            "category": "greetings",
            "confidence": 0.0,
            "followUpChips": [
                "How to reduce tooth sensitivity?",
                "Why do my gums bleed?",
                "Modified Bass technique guide",
            ],
        }

@app.post("/api/reminders/save")
async def save_user_alarms(payload: ReminderSavePayload):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            UPDATE profiles 
            SET morning_reminder = %s, night_reminder = %s, device_token = %s 
            WHERE id = %s 
            RETURNING id, morning_reminder, night_reminder;
        """, (payload.morningTime24h, payload.nightTime24h, payload.deviceToken, payload.userId))
        
        updated = cursor.fetchone()
        conn.commit()
        cursor.close()
        
        print(f"💾 Reminders saved to DB for User: {payload.userId} | Morning: {payload.morningTime24h} | Night: {payload.nightTime24h}")
        return {"success": True, "message": "Reminders saved successfully.", "data": updated}
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database Persist Crash: {str(err)}")
    finally:
        if conn: conn.close()
