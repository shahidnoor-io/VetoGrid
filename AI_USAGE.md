# AI Usage Declaration (AI_USAGE.md)

In strict compliance with **Section 6 (Implementation Rules)** of the Chilika Institute of Technology Campus Scheduling Hackathon, this document transparently declares all AI utilization within the **CampusOS AI** platform and its development lifecycle.

---

## 1. AI Models & APIs Called Inside the Product

| Model / API | Provider | Usage / Feature | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **Deterministic NLP Parser** | In-house Python Module | Natural Language & Hinglish Venue Request Parsing (`/api/v1/schedule/parse-booking-request`) | 100% offline, zero API keys required, works seamlessly without internet. |
| **Gemini 1.5 Pro / GPT-4o** | Google Vertex AI / OpenAI | Optional conversational explanation generator for complex scheduling queries. | Abstracted behind `BaseAIProvider`; manual booking form remains 100% functional if LLM is disabled or unconfigured. |

---

## 2. Strict Boundary: What the LLM is NOT Allowed to Decide

Per Section 6 rules:
> *"The LLM can read requests, ask follow-up questions, fill in forms and explain decisions. It can't be what decides whether a schedule or booking is valid. That has to be done by your own code, and every output from the LLM must go through those checks before it changes any data."*

### Explicit Architectural Boundaries:
1. **Zero Scheduling Authority**: The LLM NEVER assigns time slots, rooms, or invigilators.
2. **Zero Validity Determination**: The LLM NEVER determines whether a schedule, booking, or exam slot is valid or clash-free.
3. **Mandatory Deterministic Validation Gate**: All parsed booking entities must pass through `backend/solver.py` and `validator.py` constraint checks before being committed to persistent storage or displayed as approved.
4. **Fallback Integrity**: If an LLM API error, rate limit, or network disconnection occurs, the core manual booking, CP-SAT solver, disruption engine, and timetable views operate autonomously without degradation.

---

## 3. Prompts & Natural Language Storage

All AI prompts, intent matching patterns, and Hinglish semantic rules are centrally version-controlled in:
- `backend/app/ai/prompts/`
- `backend/app/ai/parser.py`
- `backend/app/api/routes/schedule.py` (`parse_booking_request`)

---

## 4. AI Tools Used During Development

| AI Coding Tool | Development Areas Assisted |
| :--- | :--- |
| **Antigravity IDE (Gemini 3.8 Flash)** | Scaffolding monorepo boilerplate, authoring Pydantic schemas, drafting Next.js Tailwind UI components, and generating rigorous unit tests. |

All generated code was manually inspected, architecturally vetted, and verified through independent terminal execution (`python validator.py`).
