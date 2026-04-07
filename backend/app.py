import os
import certifi
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("PORT", 5009))
MONGO_URI = os.environ.get("MONGO_URI", "")
use_database = bool(MONGO_URI)

seed_users = [
    {
        "id": "u1", "name": "Shivani", "role": "UI Engineer", "workload": 70,
        "attendance": { "presentDays": 22, "absentDays": 1, "lateDays": 2 },
        "tasks": [
            { "title": "Finish dashboard UI", "priority": "High", "dueDate": "2026-04-08" },
            { "title": "Design handoff", "priority": "Medium", "dueDate": "2026-04-10" },
        ],
    },
    {
        "id": "u2", "name": "Ravi", "role": "Backend Engineer", "workload": 60,
        "attendance": { "presentDays": 20, "absentDays": 2, "lateDays": 3 },
        "tasks": [
            { "title": "Create endpoint v2", "priority": "High", "dueDate": "2026-04-09" },
            { "title": "Review integration", "priority": "Medium", "dueDate": "2026-04-12" },
        ],
    },
    {
        "id": "u3", "name": "Harini", "role": "QA Engineer", "workload": 40,
        "attendance": { "presentDays": 23, "absentDays": 0, "lateDays": 1 },
        "tasks": [
            { "title": "Write regression tests", "priority": "Medium", "dueDate": "2026-04-11" },
            { "title": "Fix flaky cases", "priority": "Low", "dueDate": "2026-04-13" },
        ],
    },
    {
        "id": "u4", "name": "Harish", "role": "Technical Writer", "workload": 35,
        "attendance": { "presentDays": 21, "absentDays": 1, "lateDays": 2 },
        "tasks": [
            { "title": "Update user guide", "priority": "Medium", "dueDate": "2026-04-09" },
            { "title": "Release notes draft", "priority": "Low", "dueDate": "2026-04-12" },
        ],
    },
    {
        "id": "u5", "name": "Aarthi", "role": "Product Analyst", "workload": 50,
        "attendance": { "presentDays": 22, "absentDays": 1, "lateDays": 1 },
        "tasks": [
            { "title": "Refine backlog", "priority": "High", "dueDate": "2026-04-10" },
            { "title": "Prepare sprint goals", "priority": "Medium", "dueDate": "2026-04-14" },
        ],
    },
    {
        "id": "u6", "name": "Kiran", "role": "DevOps Engineer", "workload": 55,
        "attendance": { "presentDays": 21, "absentDays": 1, "lateDays": 2 },
        "tasks": [
            { "title": "Improve CI pipeline", "priority": "High", "dueDate": "2026-04-09" },
            { "title": "Cost optimization", "priority": "Medium", "dueDate": "2026-04-15" },
        ],
    },
    {
        "id": "u7", "name": "Meena", "role": "UX Researcher", "workload": 45,
        "attendance": { "presentDays": 20, "absentDays": 2, "lateDays": 2 },
        "tasks": [
            { "title": "Interview users", "priority": "Medium", "dueDate": "2026-04-11" },
            { "title": "Research summary", "priority": "Low", "dueDate": "2026-04-13" },
        ],
    },
    {
        "id": "u8", "name": "Suresh", "role": "Full Stack Engineer", "workload": 65,
        "attendance": { "presentDays": 22, "absentDays": 1, "lateDays": 1 },
        "tasks": [
            { "title": "Fix auth flow", "priority": "High", "dueDate": "2026-04-09" },
            { "title": "Implement profile API", "priority": "Medium", "dueDate": "2026-04-14" },
        ],
    },
]

seed_projects = [
    { "id": "p1", "name": "Web Redesign", "owner": "Shivani", "status": "In Progress", "progress": 68 },
    { "id": "p2", "name": "API Upgrade", "owner": "Ravi", "status": "Planned", "progress": 20 },
    { "id": "p3", "name": "Test Automation", "owner": "Harini", "status": "Completed", "progress": 100 },
    { "id": "p4", "name": "Documentation Portal", "owner": "Harish", "status": "In Progress", "progress": 47 },
    { "id": "p5", "name": "Roadmap Intelligence", "owner": "Aarthi", "status": "Planned", "progress": 18 },
    { "id": "p6", "name": "Cloud Reliability", "owner": "Kiran", "status": "In Progress", "progress": 56 },
    { "id": "p7", "name": "UX Insights Program", "owner": "Meena", "status": "In Progress", "progress": 42 },
    { "id": "p8", "name": "Platform Security", "owner": "Suresh", "status": "Planned", "progress": 15 },
]

seed_reports = [
    { "id": "r1", "name": "Sprint Velocity", "status": "Completed", "owner": "Shivani" },
    { "id": "r2", "name": "Client Feedback", "status": "Pending", "owner": "Aarthi" },
    { "id": "r3", "name": "Budget Forecast", "status": "In Review", "owner": "Ravi" },
    { "id": "r4", "name": "Quality Audit", "status": "Completed", "owner": "Harini" },
    { "id": "r5", "name": "Security Scan", "status": "Pending", "owner": "Suresh" },
    { "id": "r6", "name": "Cloud Cost Report", "status": "In Review", "owner": "Kiran" },
    { "id": "r7", "name": "UX Findings", "status": "Completed", "owner": "Meena" },
]

client = None
db = None
users_collection = None
projects_collection = None
reports_collection = None

# Fallback in-memory arrays (copies of seeds)
users = [dict(u) for u in seed_users]
projects = [dict(p) for p in seed_projects]
reports = [dict(r) for r in seed_reports]

if use_database:
    try:
        # Atlas requires certifi for TLS
        client = MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=8000)
        client.admin.command('ping')
        
        db = client.get_default_database()
        if db is None:
            db = client["project_systemdb"]
            
        users_collection = db["users"]
        projects_collection = db["projects"]
        reports_collection = db["reports"]
        
        # Check if empty to seed
        if users_collection.count_documents({}) == 0:
            users_collection.insert_many([dict(u) for u in seed_users])
        if projects_collection.count_documents({}) == 0:
            projects_collection.insert_many([dict(p) for p in seed_projects])
        if reports_collection.count_documents({}) == 0:
            reports_collection.insert_many([dict(r) for r in seed_reports])
            
        print("Connected to MongoDB")
    except Exception as e:
        print("MongoDB connection failed. Falling back to in-memory data.")
        print(e)
        use_database = False

@app.route("/", methods=["GET"])
def home():
    return "Python Backend running 🚀"

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "database": "mongodb" if use_database else "in-memory"})

@app.route("/api/users", methods=["GET"])
def get_users():
    if use_database:
        rows = list(users_collection.find())
        for r in rows:
            if "_id" in r:
                r["id"] = str(r["_id"])
                del r["_id"]
        return jsonify({"users": rows})
    return jsonify({"users": users})

@app.route("/api/projects", methods=["GET", "POST"])
def handle_projects():
    if request.method == "GET":
        if use_database:
            rows = list(projects_collection.find())
            for r in rows:
                if "_id" in r:
                    r["id"] = str(r["_id"])
                    del r["_id"]
            return jsonify({"projects": rows})
        return jsonify({"projects": projects})
    
    if request.method == "POST":
        data = request.json or {}
        name = str(data.get("name", "")).strip()
        owner = str(data.get("owner", "")).strip()
        status = str(data.get("status", "")).strip()
        progress = data.get("progress")
        
        if not name or not owner or not status or progress is None:
            return jsonify({"error": "Invalid payload for project creation."}), 400
            
        safe_progress = max(0, min(100, float(progress)))
        
        if use_database:
            res = projects_collection.insert_one({
                "name": name,
                "owner": owner,
                "status": status,
                "progress": safe_progress
            })
            return jsonify({
                "project": {
                    "id": str(res.inserted_id),
                    "name": name,
                    "owner": owner,
                    "status": status,
                    "progress": safe_progress
                }
            }), 201
            
        project = {
            "id": f"p{len(projects) + 1}",
            "name": name,
            "owner": owner,
            "status": status,
            "progress": safe_progress
        }
        projects.append(project)
        return jsonify({"project": project}), 201

@app.route("/api/reports", methods=["GET", "POST"])
def handle_reports():
    if request.method == "GET":
        if use_database:
            rows = list(reports_collection.find())
            for r in rows:
                if "_id" in r:
                    r["id"] = str(r["_id"])
                    del r["_id"]
            return jsonify({"reports": rows})
        return jsonify({"reports": reports})
        
    if request.method == "POST":
        data = request.json or {}
        name = str(data.get("name", "")).strip()
        owner = str(data.get("owner", "")).strip()
        status = str(data.get("status", "")).strip()
        
        if not name or not owner or not status:
            return jsonify({"error": "Invalid payload for report creation."}), 400
            
        if use_database:
            res = reports_collection.insert_one({
                "name": name,
                "owner": owner,
                "status": status
            })
            return jsonify({
                "report": {
                    "id": str(res.inserted_id),
                    "name": name,
                    "owner": owner,
                    "status": status
                }
            }), 201
            
        report = {"id": f"r{len(reports) + 1}", "name": name, "owner": owner, "status": status}
        reports.append(report)
        return jsonify({"report": report}), 201

if __name__ == "__main__":
    if not use_database:
        print("Backend is running with in-memory data.")
    print(f"Backend server running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
