# Third-Party Open Source Libraries & Solvers (THIRD_PARTY.md)

In strict compliance with **Section 6 (Implementation Rules)** of the Chilika Institute of Technology Campus Scheduling Hackathon, this document enumerates all open-source libraries, frameworks, and solvers integrated into **CampusOS AI**.

---

## 1. Mathematical Solvers & Optimization

| Library | License | Version | Role in CampusOS AI |
| :--- | :--- | :--- | :--- |
| **Google OR-Tools** (`ortools`) | Apache 2.0 | `^9.11.0` | Constraint Programming (CP-SAT) engine for weekly session scheduling, exam allocation, and minimal-displacement disruption solving. |
| **Pure Python Constraint Solver** | MIT / In-house | `1.0.0` | High-speed deterministic fallback solver ensuring 0-hard-violation timetables even in resource-constrained environments. |

---

## 2. Backend Web Architecture & Database

| Library | License | Version | Role |
| :--- | :--- | :--- | :--- |
| **FastAPI** | MIT | `>=0.115.0` | Asynchronous high-performance REST API routing. |
| **Uvicorn** | BSD-3-Clause | `>=0.32.0` | Production ASGI web server. |
| **Pydantic v2** | MIT | `>=2.9.0` | Data validation and JSON schema contract enforcement. |
| **SQLAlchemy 2.0** | MIT | `>=2.0.36` | Asynchronous ORM and database engine. |
| **aiosqlite** | MIT | `>=0.20.0` | Embedded async database storage engine. |
| **HTTPX** | BSD-3-Clause | `>=0.27.0` | Asynchronous HTTP client for API verification. |
| **Pytest & Pytest-Asyncio** | MIT | `>=8.3.0` | Comprehensive unit and integration test framework. |

---

## 3. Frontend User Interface & Visualization

| Library | License | Version | Role |
| :--- | :--- | :--- | :--- |
| **Next.js** | MIT | `14.2.x` | React production framework with App Router architecture. |
| **React** | MIT | `18.3.x` | Declarative component UI library. |
| **Tailwind CSS** | MIT | `3.4.x` | Utility-first responsive design tokens. |
| **Lucide React** | ISC | `^0.460.0` | Unified iconography system. |
| **clsx / tailwind-merge** | MIT | `^2.1.1` | Dynamic conditional CSS class merging. |
| **Framer Motion** | MIT | `^11.11.0` | Micro-animations and page transitions. |
| **Recharts** | MIT | `^2.13.0` | Room utilization and analytics charts. |

---

## 4. Prior Work Statement

In accordance with Section 6 rules, **all code in this repository was created specifically for the CIT Hackathon**. No pre-existing hackathon projects or commercial templates were reused.
