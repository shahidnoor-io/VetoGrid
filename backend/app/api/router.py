"""
CampusOS AI - Main API Router Registration
Aggregates versioned routes across all functional domains.
"""

from fastapi import APIRouter
from backend.app.api.routes import health, schedule, explain, bookings, admin, assistant

api_router = APIRouter()

# Core diagnostic and health route
api_router.include_router(health.router)

# Timetable & Scheduling solver
api_router.include_router(schedule.router)

# Mathematical explainer & constraint auditing
api_router.include_router(explain.router)

# Venue bookings & RBAC approvals
api_router.include_router(bookings.router)

# Admin tools & demo reset
api_router.include_router(admin.router)

# Red-team-proof AI Assistant
api_router.include_router(assistant.router)
