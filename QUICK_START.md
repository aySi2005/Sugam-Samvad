# 🚀 Quick Start Guide - Multi-Device Interpretation System

## 30-Minute Setup

### Step 1: Start Backend (5 minutes)

```powershell
# Navigate to backend
cd backend

# Install/update dependencies
pip install -r requirements.txt

# Set environment variable
$env:DIPLOMAI_SESSION_TOKEN="diplomai-test-123"

# Start server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 2: Start Frontend (5 minutes)

In a new terminal:
```powershell
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Step 3: Test API (5 minutes)

```powershell
# Test 1: Create a session
curl -X POST http://localhost:8000/api/interpretation-sessions `
  -H "Content-Type: application/json" `
  -d '{
    "title": "Test Session",
    "description": "Testing multi-device"
  }'
```

**Expected Response:**
```json
{
  "session": {
    "id": 1,
    "sessionCode": "SS-A9K2L",
    "qrCode": "data:image/png;base64,iVBOR...",
    "createdAt": "2026-09-14T12:00:00Z"
  }
}
```

### Step 4: Open in Browser (5 minutes)

Open: http://localhost:5173

**Expected Behavior:**
- See SessionHome landing page
- Two cards: "Create Session" and "Join Session"
- Click "Create Session"
- Enter title "Test Session"
- Click Create
- See modal with QR code and session code

### Step 5: Test Multi-Device Join (5 minutes)

**In Browser Tab 1 (Creator):**
- Already on session details page
- See "Start Session" button
- Note the session code (e.g., SS-A9K2L)

**In Browser Tab 2 (Participant):**
- Go to http://localhost:5173
- Click "Join Session"
- Enter session code: SS-A9K2L
- Enter name: "Participant 1"
- Select language: "Hindi"
- Click "Join"

**Expected Result:**
- Tab 2 connects to session
- Both tabs show same participants
- Language shows correctly

---

## Testing Checklist

### ✅ Backend Health
```powershell
# Check server is running
curl http://localhost:8000/api/sessions

# Should return 200 or 404 (depending on route)
```

### ✅ API Endpoints
```powershell
# Test 1: Create Session
$session = curl -X POST http://localhost:8000/api/interpretation-sessions `
  -H "Content-Type: application/json" `
  -d '{"title":"Test"}'
# Look for sessionCode in response

# Test 2: Get Session Details (replace SS-ABC123 with actual code)
curl http://localhost:8000/api/interpretation-sessions/SS-ABC123

# Test 3: Join Session
curl -X POST http://localhost:8000/api/interpretation-sessions/SS-ABC123/join `
  -H "Content-Type: application/json" `
  -d '{
    "participant_name": "Test User",
    "participant_language": "en"
  }'

# Test 4: List Participants
curl http://localhost:8000/api/interpretation-sessions/SS-ABC123/participants

# Test 5: Get Summary
curl http://localhost:8000/api/interpretation-sessions/SS-ABC123/summary

# Test 6: Export Transcript
curl http://localhost:8000/api/interpretation-sessions/SS-ABC123/transcript

# Test 7: Close Session
curl -X POST http://localhost:8000/api/interpretation-sessions/SS-ABC123/close
```

### ✅ Frontend Components
- [ ] SessionHome renders (landing page)
- [ ] SessionCreator form appears when clicking "Create Session"
- [ ] Can enter session title
- [ ] SessionDetails modal appears after submit
- [ ] QR code displays as image
- [ ] Session code shows
- [ ] Can copy session code
- [ ] Can download QR code
- [ ] SessionJoin form appears when clicking "Join Session"
- [ ] Can enter session code
- [ ] Can enter participant name
- [ ] Can select language dropdown (10 languages supported)
- [ ] Can submit join form

### ✅ Database
```powershell
# Check if database was created
Test-Path "backend/diplomai.db"

# Query sessions (using Python REPL or any SQLite client)
python -c "
import sqlite3
conn = sqlite3.connect('backend/diplomai.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM interpretation_sessions')
for row in cursor.fetchall():
    print(row)
"
```

---

## Troubleshooting

### ❌ Backend won't start

**Error**: "DIPLOMAI_SESSION_TOKEN not set"
```powershell
# Solution
$env:DIPLOMAI_SESSION_TOKEN="diplomai-test-123"
uvicorn app.main:app --reload
```

**Error**: "Address already in use"
```powershell
# Solution: Kill existing process on port 8000
netstat -ano | findstr :8000
taskkill /PID {PID} /F
```

### ❌ Frontend won't load

**Error**: "GET request to /api/sessions failed"
```
# Solution: Make sure backend is running on http://localhost:8000
# Check CORS is enabled in main.py
```

**Error**: "Cannot find module"
```powershell
# Solution
cd frontend
npm install
npm run dev
```

### ❌ QR code not showing

**Error**: Image not loading
```
# Solution
pip install Pillow
```

### ❌ Cannot join session

**Error**: "Session not found"
- Check session code is correct (case-sensitive)
- Check session is still active
- Check database has entry

```powershell
# Debug: Check session exists
curl http://localhost:8000/api/interpretation-sessions/SS-ABC123
```

**Error**: "WebSocket connection failed"
- Check backend is running
- Check session code is valid
- Check participant_id is an integer

---

## What Each Component Does

### SessionHome (Landing Page)
```jsx
Shows two options:
1. "Create Session" → Goes to SessionCreator
2. "Join Session" → Goes to SessionJoin
```

### SessionCreator (Create Page)
```jsx
Form:
  - Title (required)
  - Description (optional)
Submit → Backend creates session → Shows SessionDetails
```

### SessionDetails (QR Page)
```jsx
Shows:
  - QR Code as PNG image
  - Session Code (copyable)
  - Join URL
  - Instructions
  - "Start Session" button
```

### SessionJoin (Join Page)
```jsx
Form:
  - Session Code
  - Participant Name
  - Language Dropdown (en, hi, fr, ar, es, ru, it, ja, de, he)
Submit → Joins session → Can participate in real-time
```

---

## Database Structure

### interpretation_sessions
Stores session metadata
```
id (Primary Key)
session_code (Unique) - "SS-A9K2L"
creator_user_id
title
description
created_at
is_active
```

### participants
Stores who joined what session
```
id (Primary Key)
interpretation_session_id (Foreign Key)
participant_name - "Ambassador Smith"
participant_language - "en"
user_id
joined_at
socket_id
```

### interpretations
Stores all interpreted messages
```
id (Primary Key)
interpretation_session_id (Foreign Key)
participant_id (Foreign Key)
source_language - "en"
transcript - "Original speech"
translations - {"hi": "...", "fr": "..."}
risk_analysis - {"riskScore": 0.5, "flags": [...]}
created_at
```

---

## Sample Session Flow

### Create Session
```
1. User clicks "Create Session"
2. Fills: Title = "Trade Talk 2026"
3. Clicks Create
4. Backend:
   - Generates code: SS-K9X2L
   - Creates QR PNG: SS-K9X2L.png
   - Saves to interpretation_sessions table
5. User sees QR code + code
6. User shares QR code or code with others
```

### Join Session
```
1. Other user gets QR code
2. User scans QR → Redirects to join page with code
3. Or manually enters: SS-K9X2L
4. Fills: Name = "Ambassador Singh", Language = "Hindi"
5. Clicks Join
6. Backend:
   - Looks up session
   - Creates participant record
   - Returns participant ID
7. Frontend opens WebSocket:
   ws://localhost:8000/ws/session/SS-K9X2L/5
```

### During Session
```
Participant A speaks (English):
  "We cannot accept this proposal"
  
Backend processes:
  - Transcribe: "We cannot accept this proposal"
  - Translate Hindi: "हम इस प्रस्ताव को स्वीकार नहीं कर सकते"
  - Translate French: "Nous ne pouvons pas accepter cette proposition"
  - Analyze Risk: 0.7 (escalatory language)
  
Send to participants:
  - To Hindi speakers: "हम इस प्रस्ताव को स्वीकार नहीं कर सकते" (risk: 0.7)
  - To French speakers: "Nous ne pouvons pas accepter cette proposition" (risk: 0.7)
  - To English speakers: "We cannot accept this proposal" (risk: 0.7)

Store in DB:
  - interpretations table records everything
```

### End Session
```
1. Click "Close Session" or time out
2. Backend marks session as_active = 0
3. All participants disconnected
4. User can export transcript:
   GET /api/interpretation-sessions/SS-K9X2L/transcript
5. Get formatted document with all messages, times, languages, risk scores
```

---

## Next Steps After Setup

### Short Term (This Week)
1. ✅ Get system running locally
2. Test creating/joining sessions
3. Verify QR code generation
4. Check database storage
5. Test multi-device with 2 browsers

### Medium Term (Next Week)
1. Connect audio pipeline to WebSocket
2. Add real audio input
3. Test full end-to-end interpretation
4. Verify language routing works
5. Check transcript export format

### Long Term (Next Month)
1. Add real-time status dashboard
2. Implement participant status indicators
3. Add session history/archive
4. Build analytics dashboard
5. Add admin controls

---

## Performance Tips

### For Testing
- Clear browser cache: Ctrl+Shift+Delete
- Reload frontend: Ctrl+Shift+R
- Check console for errors: F12 → Console tab

### For Production
- Use database indexes
- Implement connection pooling
- Add caching layer
- Rate limit API calls

---

## Getting Help

### Check These Files
1. `IMPLEMENTATION_COMPLETE.md` - Complete technical guide
2. `MULTI_DEVICE_IMPLEMENTATION.md` - Architecture details
3. `README.md` - Project overview

### Common Errors
- See "Troubleshooting" section above
- Check backend console for error messages
- Check browser console (F12) for frontend errors
- Check database exists: `backend/diplomai.db`

---

## Success Criteria

✅ System is ready when:
- [ ] Backend runs without errors
- [ ] Frontend loads on http://localhost:5173
- [ ] Can create session and see QR code
- [ ] Can join session with another browser
- [ ] Session code appears correctly
- [ ] Participant list updates
- [ ] Can export transcript
- [ ] Database has records

🎉 Congratulations when all above are checked!

---

**Ready to go?**
1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Open: http://localhost:5173
4. Create a session and test!

Good luck! 🚀
