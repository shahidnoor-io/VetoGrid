# CampusOS AI — Intelligent Campus Scheduling & Venue Management Platform

> **Institution:** Chilika Institute of Technology (CIT)  
> **Status:** Production-Ready Hackathon Submission  
> **Constraint Engine:** Deterministic CP-SAT Constraint Propagation (0% LLM Decision Authority)  
> **Independent Verification:** Passed `validator.py` with 0 Hard Violations  
> **Visual Identity:** Deep Navy with Electric Blue & Cyan Accents (Commercial SaaS)

---

## 1. Project Overview & Problem Statement Alignment

CampusOS AI is an enterprise-grade campus scheduling and venue management platform engineered specifically for **Chilika Institute of Technology (CIT) Week 7 (Spectra Week & Midsems)**.

### Core Mathematical & Operational Guarantee
**CRITICAL RULE ADHERENCE:** An LLM is NEVER used to decide whether a schedule, timetable slot, or venue booking is valid. All scheduling, conflict checks, and rescheduling are solved deterministically in Python using CP-SAT constraint programming and verified independently by `validator.py`.

The platform implements all requirements across Sections 3, 4, 5, and 9 of the problem statement:
- **Clash-Free Academic Timetable (189 Sessions):** Exactly 243 teaching contact hours scheduled across 27 rooms and 40 faculty members with **0 hard conflicts** and minimized soft penalties.
- **Midsemester Examination Scheduling (41 Exams):** Conflict-free 2-hour morning (09:00–11:00) and afternoon (14:00–16:00) examination slots with strictly enforced **halved room seating capacities** and unique faculty invigilation assignments.
- **Spectra Venue Booking Optimization (25 Requests):** High-priority cultural & technical festival venue reservations evaluated against academic timetables, maintenance windows, and attendee caps.
- **Disruption Recovery with Minimal Perturbation:** Emergency room repairs (`LH-104`) and faculty medical leave (`FAC-05`) recovered with strictly minimized campus displacement ($L_1 \le 3$, exactly 1 session moved).
- **Four Explicit RBAC Roles & Strict Self-Approval Ban:** Dean/Admin, Department Coordinator, Faculty Member, and Club Representative. An approver is mathematically prohibited from approving their own venue booking request.
- **Red-Team-Proof AI Assistant:** Natural language English and Hinglish conversational interface protected against jailbreaks, prompt injection, and unauthorized role escalation, backed by manual form fallbacks.
- **Judge Dataset Hot-Swapping (Requirement 9):** Dynamic dataset and disruption change file JSON uploaders to immediately evaluate arbitrary judge test cases and export `exports/schedule.json` and `exports/schedule_after.json`.

---

## 2. Official Dataset Section 5 Counts

The system strictly adheres to the exact counts specified in Section 5:
- **27 Rooms:** Classrooms, lecture halls (LT-101, LT-102), Main Auditorium (`AUD-01`, cap 500), seminar halls (`SH-201`, `SH-202`), Open-Air Theatre (`OAT-01`), and 7 specialized laboratories (Physics, Chemistry, Computer Labs 1 & 2, Electronics, Mechanical Workshop, Civil CAD) with accessibility flags and maintenance windows.
- **40 Faculty Members:** Teaching load capped at $\le 4$ contact hours/day, with defined avoid-preference windows and unavailability periods.
- **14 Student Groups:** Year 1 sections A–D, and Year 2 & 3 cohorts across CSE, ECE, ME, CE, and EE.
- **62 Courses & 189 Sessions (243 contact hours/week):** Lectures, tutorials, and contiguous 3-hour lab sessions.
- **25 Spectra Booking Requests:** Tiers 3 to 6 (Institute, Guest Lecture, Department, Club), including 1 pre-cancelled request.
- **41 Midsemester Examinations:** Scheduled with halved room seating capacities to guarantee physical spacing.

---

## 3. Independent Verification Instructions for Judges

Judges can verify both baseline and post-disruption schedules using the standalone, pure Python `validator.py`:

```bash
# Validate baseline schedule (189 sessions, 41 exams, 25 Spectra bookings)
python validator.py exports/schedule.json

# Validate baseline AND disruption schedule with minimal displacement
python validator.py exports/schedule.json --after exports/schedule_after.json
```

### Verified Benchmark Output:
```text
============================================================
CIT OFFICIAL SCHEDULE VALIDATION REPORT
============================================================
Dataset:            data/official/cit_public.json
Schedule File:      exports/schedule.json
Status:             PASS (VALID)
Hard Violations:    0
Soft Penalty:       129
Booking Score:      119 (Approved: 20)
Sessions Checked:   189 / 189
Exams Checked:      41 / 41
------------------------------------------------------------
SOFT PENALTY BREAKDOWN:
  - faculty_avoid_preference: 15
  - student_group_gap: 44
  - student_group_over_6h: 0
  - duplicate_course_same_day: 0
  - room_capacity_under_40pct: 70
  - session_in_p9: 0
============================================================

============================================================
DISRUPTION MINIMAL-DISPLACEMENT REPORT
============================================================
Total Moved Sessions: 1
New Sessions Added:   1
============================================================
```

---

## 4. Quick Start & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Step 1: Clone and Environment Setup
```bash
git clone https://github.com/AnirudhJha982/IITBBS-Final.git
cd IITBBS-Final

# Create environment file
copy .env.example .env
```

### Step 2: Run Backend Tests & Start Backend
```bash
# Run 15 comprehensive unit & integration tests
python -m pytest backend/tests

# Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive API Docs: `http://localhost:8000/api/v1/docs`
- Health Diagnostics: `http://localhost:8000/api/v1/health`

### Step 3: Start Next.js Frontend
```bash
cd frontend
npm install
npm run build
npm run start
```
- Interactive Web App: `http://localhost:3000`

---

## 5. Key System Capabilities & UI Modules

| Route | Feature | Key Implementation Details |
| :--- | :--- | :--- |
| `/timetable` | Interactive Timetable Matrix | P1–P9 grid (with 13:00–14:00 Lunch Break highlighted). Filterable by Student Group (14), Faculty (40), and Venue (27). |
| `/venue-bookings` | Spectra Booking & RBAC Approvals | Interactive role switcher with **Self-Approval Ban** enforcement. Approve/Reject actions and manual booking form modal. |
| `/assistant` | Red-Team-Proof AI Assistant | English & Hinglish NLP parser with multi-layer prompt injection defense and structured proposal verification cards. |
| `/rescheduling` | Minimal-Displacement Engine | Disruption simulator recovering from faculty emergency leave and room closures with exact diff table. |
| `/examinations` | Midsem Exam Scheduler | 41 exams across Mon–Fri in morning and afternoon windows with strict halved seating capacity checks. |
| `/settings` | Judge Hot-Swap Tools (Req 9) | JSON dataset and change file uploaders, one-click re-solve, and JSON schedule export downloads. |

---

## 6. Security, RBAC & Red-Team AI Defense

### Role-Based Access Control (RBAC)
1. **Super Admin / Dean's Office (`DEAN-01`):** Full scheduling authority, booking approval, disruption simulation, and dataset hot-swapping.
2. **Department Coordinator (`COORD-CSE`):** Department-level schedule oversight and booking approval rights.
3. **Faculty Member (`FAC-01`):** Personal schedule review and venue booking submission (no approval rights).
4. **Club Representative (`CLUB-LIT-01`):** Event booking submission and alternative venue exploration (no approval rights).

### Strict Self-Approval Ban
If an approver attempts to approve their own booking request (`approver_id == requester_id`), the API returns HTTP 403 Forbidden:
```json
{
  "detail": "Self-approval violation: An approver cannot approve or reject their own booking request."
}
```

### Red-Team Prompt Injection Defense
The AI Assistant includes pattern matching against:
- Jailbreak attempts (`"Ignore previous instructions"`, `"developer mode"`)
- Unauthorized role impersonations (`"I am the Dean"`, `"grant me admin rights"`)
- Constraint bypass directives (`"bypass validator"`, `"approve without check"`)

---

## 7. Mandatory Submission Deliverables

- `README.md`: This comprehensive architecture and verification guide.
- `.env.example`: Complete environment variable blueprint.
- `AI_USAGE.md`: Section 6 mandatory declaration of AI tool usage.
- `THIRD_PARTY.md`: Section 7 mandatory inventory of external libraries and licenses.
- `exports/schedule.json`: Fully solved baseline schedule (189 sessions, 41 exams, 20 approved bookings, 0 hard violations).
- `exports/schedule_after.json`: Minimal-displacement disruption schedule (1 session moved).
- `validator.py`: Official standalone verification script.
