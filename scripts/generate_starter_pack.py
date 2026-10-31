"""
CampusOS AI - Starter Pack Generator
Generates a complete, mathematically solvable ground-truth dataset matching CIT Hackathon specifications.
- 27 rooms (including 7 specialized labs)
- 40 faculty members (with 4h daily limits, unavailability, and avoid preferences)
- 14 student groups (Year 1 Sec A-D, Year 2 & 3 for 5 branches)
- 62 courses
- 189 sessions totaling 243 teaching hours (27 3-hr labs, 162 1-hr sessions, combined lectures, fixed slots, accessibility, elective baskets)
- 25 Spectra week booking requests (English & Hinglish, 1 cancelled)
- 41 midsem exams
- sample_disruption.json
- validator.py
"""

import json
import os
import csv

def generate_all():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    official_dir = os.path.join(base_dir, "data", "official")
    csv_dir = os.path.join(official_dir, "csv")
    os.makedirs(official_dir, exist_ok=True)
    os.makedirs(csv_dir, exist_ok=True)

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    # 1. Rooms (27 total: 7 labs, 2 large theatres, 3 seminar/OAT, 15 classrooms/lecture halls)
    rooms = [
        # Specialized Labs (7) - Capacity 75 ensures all cohort sizes (50-65) fit comfortably
        {"room_id": "LAB-PHY", "name": "Sir C.V. Raman Physics Lab", "type": "physics_lab", "capacity": 75, "features": ["optical_benches", "dark_room"], "is_accessible": True, "maintenance": []},
        {"room_id": "LAB-CHEM", "name": "P.C. Ray Chemistry Lab", "type": "chemistry_lab", "capacity": 75, "features": ["fume_hoods", "titration_stations"], "is_accessible": True, "maintenance": []},
        {"room_id": "LAB-CS1", "name": "Alan Turing Computer Lab 1", "type": "computer_lab", "capacity": 80, "features": ["workstations", "gigabit_lan", "projector", "ac"], "is_accessible": True, "maintenance": []},
        {"room_id": "LAB-CS2", "name": "Ada Lovelace Computer Lab 2", "type": "computer_lab", "capacity": 80, "features": ["workstations", "gpu_cluster", "projector", "ac"], "is_accessible": False, "maintenance": [{"day": "Friday", "start_period": 1, "end_period": 3, "reason": "Server maintenance"}]},
        {"room_id": "LAB-ECE", "name": "J.C. Bose Electronics & VLSI Lab", "type": "electronics_lab", "capacity": 75, "features": ["oscilloscopes", "fpga_kits", "soldering_stations"], "is_accessible": True, "maintenance": []},
        {"room_id": "LAB-MECH", "name": "Visvesvaraya Mechanical Workshop", "type": "workshop", "capacity": 75, "features": ["lathes", "cnc_mills", "safety_gear"], "is_accessible": False, "maintenance": []},
        {"room_id": "LAB-CIVIL", "name": "Civil Engineering & CAD Lab", "type": "cad_lab", "capacity": 75, "features": ["cad_stations", "total_stations"], "is_accessible": True, "maintenance": []},
        
        # Auditoriums & Large Lecture Theatres (2) - Capacity 500 & 320 for halved exam capacities
        {"room_id": "AUD-01", "name": "Main Auditorium", "type": "auditorium", "capacity": 500, "features": ["stage_lighting", "surround_sound", "dual_projectors", "ac"], "is_accessible": True, "maintenance": []},
        {"room_id": "LT-101", "name": "Grand Lecture Theatre 101", "type": "lecture_hall", "capacity": 320, "features": ["stepped_seating", "dual_projectors", "mic_system", "ac"], "is_accessible": True, "maintenance": []},

        # Seminar Halls & Open-Air Theatre (3)
        {"room_id": "SH-201", "name": "Vikram Sarabhai Seminar Hall", "type": "seminar_hall", "capacity": 150, "features": ["video_conferencing", "podium", "smartboard", "ac"], "is_accessible": True, "maintenance": []},
        {"room_id": "SH-202", "name": "Homi Bhabha Seminar Hall", "type": "seminar_hall", "capacity": 140, "features": ["smartboard", "podium", "ac"], "is_accessible": False, "maintenance": []},
        {"room_id": "OAT-01", "name": "Chilika Open Air Amphitheatre", "type": "open_air_theatre", "capacity": 600, "features": ["open_air_stage", "acoustic_shell"], "is_accessible": True, "maintenance": []},

        # Lecture Halls (5) - Capacity 160-180 (effective halved = 80-90 for exams)
        {"room_id": "LH-102", "name": "Lecture Hall 102", "type": "lecture_hall", "capacity": 180, "features": ["projector", "ac"], "is_accessible": True, "maintenance": []},
        {"room_id": "LH-103", "name": "Lecture Hall 103", "type": "lecture_hall", "capacity": 180, "features": ["projector", "ac"], "is_accessible": True, "maintenance": []},
        {"room_id": "LH-104", "name": "Lecture Hall 104", "type": "lecture_hall", "capacity": 170, "features": ["projector", "ac"], "is_accessible": False, "maintenance": []},
        {"room_id": "LH-105", "name": "Lecture Hall 105", "type": "lecture_hall", "capacity": 160, "features": ["projector"], "is_accessible": True, "maintenance": []},
        {"room_id": "LH-106", "name": "Lecture Hall 106", "type": "lecture_hall", "capacity": 160, "features": ["projector"], "is_accessible": False, "maintenance": []},

        # Standard Classrooms (10) - Capacity 80 (effective halved = 40 for exams)
        {"room_id": "CR-201", "name": "Classroom 201", "type": "classroom", "capacity": 80, "features": ["projector", "whiteboard"], "is_accessible": True, "maintenance": []},
        {"room_id": "CR-202", "name": "Classroom 202", "type": "classroom", "capacity": 80, "features": ["projector", "whiteboard"], "is_accessible": True, "maintenance": []},
        {"room_id": "CR-203", "name": "Classroom 203", "type": "classroom", "capacity": 80, "features": ["projector", "whiteboard"], "is_accessible": False, "maintenance": []},
        {"room_id": "CR-204", "name": "Classroom 204", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": True, "maintenance": []},
        {"room_id": "CR-205", "name": "Classroom 205", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": True, "maintenance": [{"day": "Wednesday", "start_period": 6, "end_period": 8, "reason": "A/C duct sanitization"}]},
        {"room_id": "CR-206", "name": "Classroom 206", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": False, "maintenance": []},
        {"room_id": "CR-207", "name": "Classroom 207", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": True, "maintenance": []},
        {"room_id": "CR-208", "name": "Classroom 208", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": False, "maintenance": []},
        {"room_id": "CR-209", "name": "Classroom 209", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": True, "maintenance": []},
        {"room_id": "CR-210", "name": "Classroom 210", "type": "classroom", "capacity": 80, "features": ["whiteboard"], "is_accessible": False, "maintenance": []},
    ]
    assert len(rooms) == 27, f"Expected 27 rooms, got {len(rooms)}"

    # 2. Faculty (40 total)
    departments = ["CSE", "ECE", "ME", "CE", "EE", "MATH", "PHY", "HUM"]
    faculty_names = [
        ("FAC-01", "Dr. Rajesh Sharma", "CSE"), ("FAC-02", "Prof. Ananya Sen", "CSE"),
        ("FAC-03", "Dr. Vikram Sethi", "CSE"), ("FAC-04", "Prof. Sneha Reddy", "CSE"),
        ("FAC-05", "Dr. Amit Patel", "CSE"), ("FAC-06", "Prof. Divya Nair", "CSE"),
        ("FAC-07", "Dr. Karthik Raman", "CSE"), ("FAC-08", "Prof. Priya Iyer", "CSE"),
        ("FAC-09", "Dr. Sandeep Das", "ECE"), ("FAC-10", "Prof. Meera Joshi", "ECE"),
        ("FAC-11", "Dr. Arjun Gupta", "ECE"), ("FAC-12", "Prof. Ritu Verma", "ECE"),
        ("FAC-13", "Dr. Sunil Kumar", "ECE"), ("FAC-14", "Prof. Pooja Hegde", "ECE"),
        ("FAC-15", "Dr. Rohan Bhatt", "ME"), ("FAC-16", "Prof. Kavita Rao", "ME"),
        ("FAC-17", "Dr. Manoj Tiwari", "ME"), ("FAC-18", "Prof. Shweta Mishra", "ME"),
        ("FAC-19", "Dr. Tarun Ghosh", "ME"), ("FAC-20", "Dr. Suresh Raina", "CE"),
        ("FAC-21", "Prof. Neha Agarwal", "CE"), ("FAC-22", "Dr. Vinod Prasad", "CE"),
        ("FAC-23", "Prof. Alok Nath", "CE"), ("FAC-24", "Dr. Pradeep Rawat", "EE"),
        ("FAC-25", "Prof. Geeta Menon", "EE"), ("FAC-26", "Dr. Harish Salve", "EE"),
        ("FAC-27", "Prof. Vandana Shiva", "EE"), ("FAC-28", "Dr. Deepak Chopra", "MATH"),
        ("FAC-29", "Prof. Sunita Williams", "MATH"), ("FAC-30", "Dr. Raghuram Rajan", "MATH"),
        ("FAC-31", "Dr. Homi Sethna", "PHY"), ("FAC-32", "Prof. Jayant Narlikar", "PHY"),
        ("FAC-33", "Dr. Asima Chatterjee", "PHY"), ("FAC-34", "Dr. Amartya Sen", "HUM"),
        ("FAC-35", "Prof. Arundhati Roy", "HUM"), ("FAC-36", "Dr. Shashi Tharoor", "HUM"),
        ("FAC-37", "Dr. K. Radhakrishnan", "CSE"), ("FAC-38", "Prof. Tessy Thomas", "ME"),
        ("FAC-39", "Dr. M.S. Swaminathan", "CE"), ("FAC-40", "Prof. C.R. Rao", "MATH")
    ]
    faculty = []
    for idx, (fid, name, dept) in enumerate(faculty_names):
        unavail = []
        avoid = []
        # Realistic constraints: a few faculty have unavailability or avoid preferences
        if fid == "FAC-03":
            unavail.append({"day": "Tuesday", "period": 1})
            unavail.append({"day": "Tuesday", "period": 2})
        elif fid == "FAC-07":
            unavail.append({"day": "Thursday", "period": 8})
            unavail.append({"day": "Thursday", "period": 9})
        elif fid == "FAC-12":
            unavail.append({"day": "Wednesday", "period": 1})
        elif fid == "FAC-20":
            unavail.append({"day": "Friday", "period": 9})

        # Avoid preferences (soft constraint)
        if idx % 3 == 0:
            avoid.append({"day": "Monday", "period": 1})
        if idx % 5 == 0:
            avoid.append({"day": "Friday", "period": 9})

        faculty.append({
            "faculty_id": fid,
            "name": name,
            "department": dept,
            "daily_limit_hours": 4,
            "unavailability": unavail,
            "avoid_preferences": avoid
        })
    assert len(faculty) == 40, f"Expected 40 faculty, got {len(faculty)}"

    # 3. Student Groups (14 total)
    student_groups = [
        {"group_id": "Y1-SecA", "name": "Year 1 Section A", "year": 1, "size": 60},
        {"group_id": "Y1-SecB", "name": "Year 1 Section B", "year": 1, "size": 60},
        {"group_id": "Y1-SecC", "name": "Year 1 Section C", "year": 1, "size": 60},
        {"group_id": "Y1-SecD", "name": "Year 1 Section D", "year": 1, "size": 60},
        {"group_id": "Y2-CSE", "name": "Year 2 Computer Science", "year": 2, "size": 65},
        {"group_id": "Y2-ECE", "name": "Year 2 Electronics & Comm", "year": 2, "size": 60},
        {"group_id": "Y2-ME", "name": "Year 2 Mechanical Engg", "year": 2, "size": 55},
        {"group_id": "Y2-CE", "name": "Year 2 Civil Engg", "year": 2, "size": 50},
        {"group_id": "Y2-EE", "name": "Year 2 Electrical Engg", "year": 2, "size": 50},
        {"group_id": "Y3-CSE", "name": "Year 3 Computer Science", "year": 3, "size": 65},
        {"group_id": "Y3-ECE", "name": "Year 3 Electronics & Comm", "year": 3, "size": 60},
        {"group_id": "Y3-ME", "name": "Year 3 Mechanical Engg", "year": 3, "size": 55},
        {"group_id": "Y3-CE", "name": "Year 3 Civil Engg", "year": 3, "size": 50},
        {"group_id": "Y3-EE", "name": "Year 3 Electrical Engg", "year": 3, "size": 50},
    ]
    assert len(student_groups) == 14, f"Expected 14 groups, got {len(student_groups)}"

    # 4. Courses (62 total)
    courses = []
    # Year 1 Common Courses (8)
    courses += [
        {"course_id": "MA101", "name": "Engineering Mathematics I", "department": "MATH", "credits": 4},
        {"course_id": "PH101", "name": "Engineering Physics", "department": "PHY", "credits": 4},
        {"course_id": "CH101", "name": "Engineering Chemistry", "department": "PHY", "credits": 3},
        {"course_id": "CS101", "name": "Programming in C & Data Structures", "department": "CSE", "credits": 4},
        {"course_id": "ME101", "name": "Engineering Mechanics & Graphics", "department": "ME", "credits": 3},
        {"course_id": "EE101", "name": "Basic Electrical & Electronics", "department": "EE", "credits": 3},
        {"course_id": "HS101", "name": "Technical Communication & Ethics", "department": "HUM", "credits": 2},
        {"course_id": "EV101", "name": "Environmental Science", "department": "CE", "credits": 2},
    ]
    # Year 2 Department Courses (5 * 5 = 25)
    y2_depts = [
        ("CSE", ["CS201", "CS202", "CS203", "CS204", "CS205"], ["Discrete Maths", "Object Oriented Design", "Computer Architecture", "Data Structures & Algos", "Digital Logic Design"]),
        ("ECE", ["EC201", "EC202", "EC203", "EC204", "EC205"], ["Signals & Systems", "Analog Circuits", "Electromagnetic Fields", "Network Analysis", "Semiconductor Devices"]),
        ("ME", ["ME201", "ME202", "ME203", "ME204", "ME205"], ["Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Manufacturing Processes", "Kinematics of Machinery"]),
        ("CE", ["CE201", "CE202", "CE203", "CE204", "CE205"], ["Surveying", "Structural Analysis I", "Building Materials", "Engineering Geology", "Hydraulics & Flow"]),
        ("EE", ["EE201", "EE202", "EE203", "EE204", "EE205"], ["Electrical Machines I", "Power Systems I", "Control Systems", "Circuit Theory", "Measurement & Instrumentation"]),
    ]
    for dept, cids, cnames in y2_depts:
        for cid, cname in zip(cids, cnames):
            courses.append({"course_id": cid, "name": cname, "department": dept, "credits": 4})

    # Year 3 Department Courses (5 * 5 = 25)
    y3_depts = [
        ("CSE", ["CS301", "CS302", "CS303", "CS304", "CS305"], ["Database Systems", "Operating Systems", "Compiler Design", "Machine Learning", "Computer Networks"]),
        ("ECE", ["EC301", "EC302", "EC303", "EC304", "EC305"], ["Digital Signal Processing", "Microcontrollers & Embedded", "VLSI Design", "Antennas & Propagation", "Optical Comm"]),
        ("ME", ["ME301", "ME302", "ME303", "ME304", "ME305"], ["Heat & Mass Transfer", "Design of Machine Elements", "IC Engines", "Dynamics of Machinery", "Turbo Machinery"]),
        ("CE", ["CE301", "CE302", "CE303", "CE304", "CE305"], ["Design of Concrete Structures", "Geotechnical Engineering", "Transportation Engineering", "Water Resources", "Environmental Engg II"]),
        ("EE", ["EE301", "EE302", "EE303", "EE304", "EE305"], ["Power Electronics", "Power Systems II", "Electrical Machines II", "Digital Control", "Renewable Energy Systems"]),
    ]
    for dept, cids, cnames in y3_depts:
        for cid, cname in zip(cids, cnames):
            courses.append({"course_id": cid, "name": cname, "department": dept, "credits": 4})

    # Elective Baskets (4 courses: 2 for CSE/ECE, 2 for ME/CE/EE)
    courses += [
        {"course_id": "EL301", "name": "Cloud Computing (PE Basket A)", "department": "CSE", "credits": 3},
        {"course_id": "EL302", "name": "Cybersecurity (PE Basket A)", "department": "CSE", "credits": 3},
        {"course_id": "EL303", "name": "Robotics & Automation (PE Basket B)", "department": "ME", "credits": 3},
        {"course_id": "EL304", "name": "Supply Chain & Operations (PE Basket B)", "department": "ME", "credits": 3},
    ]
    assert len(courses) == 62, f"Expected 62 courses, got {len(courses)}"

    # 5. Sessions to Schedule: EXACTLY 189 sessions, EXACTLY 243 teaching hours!
    # Mathematically: 27 3-hour labs (81 hours) + 162 1-hour sessions (162 hours) = 189 sessions & 243 hours.
    sessions = []
    
    # 27 3-Hour Labs:
    # 8 labs for Year 1 (Physics Lab, Chem Lab, CS Lab, Workshop for sections A, B, C, D)
    # 10 labs for Year 2 (2 labs per branch)
    # 9 labs for Year 3 (2 for CSE, 2 for ECE, 2 for ME, 2 for CE, 1 for EE) -> 8 + 10 + 9 = 27 labs!
    lab_defs = [
        # Y1 Labs (8)
        ("SES-LAB-01", "PH101", ["Y1-SecA"], "FAC-31", "physics_lab", False),
        ("SES-LAB-02", "PH101", ["Y1-SecB"], "FAC-32", "physics_lab", False),
        ("SES-LAB-03", "CH101", ["Y1-SecC"], "FAC-33", "chemistry_lab", True),
        ("SES-LAB-04", "CH101", ["Y1-SecD"], "FAC-33", "chemistry_lab", False),
        ("SES-LAB-05", "CS101", ["Y1-SecA"], "FAC-01", "computer_lab", True),
        ("SES-LAB-06", "CS101", ["Y1-SecB"], "FAC-02", "computer_lab", False),
        ("SES-LAB-07", "ME101", ["Y1-SecC"], "FAC-15", "workshop", False),
        ("SES-LAB-08", "ME101", ["Y1-SecD"], "FAC-16", "workshop", False),
        # Y2 Labs (10)
        ("SES-LAB-09", "CS202", ["Y2-CSE"], "FAC-03", "computer_lab", True),
        ("SES-LAB-10", "CS204", ["Y2-CSE"], "FAC-04", "computer_lab", False),
        ("SES-LAB-11", "EC202", ["Y2-ECE"], "FAC-09", "electronics_lab", True),
        ("SES-LAB-12", "EC204", ["Y2-ECE"], "FAC-10", "electronics_lab", False),
        ("SES-LAB-13", "ME202", ["Y2-ME"], "FAC-17", "workshop", False),
        ("SES-LAB-14", "ME204", ["Y2-ME"], "FAC-18", "workshop", False),
        ("SES-LAB-15", "CE201", ["Y2-CE"], "FAC-20", "cad_lab", True),
        ("SES-LAB-16", "CE203", ["Y2-CE"], "FAC-21", "cad_lab", False),
        ("SES-LAB-17", "EE201", ["Y2-EE"], "FAC-24", "electronics_lab", True),
        ("SES-LAB-18", "EE203", ["Y2-EE"], "FAC-25", "electronics_lab", False),
        # Y3 Labs (9)
        ("SES-LAB-19", "CS301", ["Y3-CSE"], "FAC-05", "computer_lab", True),
        ("SES-LAB-20", "CS305", ["Y3-CSE"], "FAC-06", "computer_lab", False),
        ("SES-LAB-21", "EC302", ["Y3-ECE"], "FAC-11", "electronics_lab", True),
        ("SES-LAB-22", "EC303", ["Y3-ECE"], "FAC-12", "electronics_lab", False),
        ("SES-LAB-23", "ME301", ["Y3-ME"], "FAC-19", "workshop", False),
        ("SES-LAB-24", "ME303", ["Y3-ME"], "FAC-38", "workshop", False),
        ("SES-LAB-25", "CE302", ["Y3-CE"], "FAC-22", "cad_lab", True),
        ("SES-LAB-26", "CE303", ["Y3-CE"], "FAC-23", "cad_lab", False),
        ("SES-LAB-27", "EE301", ["Y3-EE"], "FAC-26", "electronics_lab", True),
    ]
    assert len(lab_defs) == 27

    for sid, cid, groups, fac, rtype, needs_acc in lab_defs:
        sessions.append({
            "session_id": sid,
            "course_id": cid,
            "session_type": "lab",
            "duration": 3,
            "student_groups": groups,
            "faculty_id": fac,
            "required_room_type": rtype,
            "needs_accessible_room": needs_acc,
            "fixed_slot": None,
            "elective_basket": None
        })

    # 162 1-Hour Lecture/Tutorial Sessions:
    # 4 Combined Lectures (e.g. Y1-SecA + Y1-SecB for Math/Physics) in LT-101 / AUD-01
    # 5 Fixed-Slot sessions
    # 4 Elective Basket sessions
    # 149 Regular classroom/lecture hall sessions
    
    # 4 Combined Lectures:
    combined_defs = [
        ("SES-COMB-01", "MA101", ["Y1-SecA", "Y1-SecB"], "FAC-28", "lecture_hall", True),
        ("SES-COMB-02", "MA101", ["Y1-SecC", "Y1-SecD"], "FAC-29", "lecture_hall", True),
        ("SES-COMB-03", "PH101", ["Y1-SecA", "Y1-SecB"], "FAC-31", "lecture_hall", False),
        ("SES-COMB-04", "PH101", ["Y1-SecC", "Y1-SecD"], "FAC-32", "lecture_hall", False),
    ]
    for sid, cid, groups, fac, rtype, needs_acc in combined_defs:
        sessions.append({
            "session_id": sid,
            "course_id": cid,
            "session_type": "lecture",
            "duration": 1,
            "student_groups": groups,
            "faculty_id": fac,
            "required_room_type": rtype,
            "needs_accessible_room": needs_acc,
            "fixed_slot": None,
            "elective_basket": None
        })

    # 5 Fixed Slot Sessions:
    fixed_defs = [
        ("SES-FIX-01", "HS101", ["Y1-SecA"], "FAC-34", "classroom", True, {"day": "Monday", "start_period": 1, "room_id": "CR-201"}),
        ("SES-FIX-02", "HS101", ["Y1-SecB"], "FAC-35", "classroom", False, {"day": "Monday", "start_period": 2, "room_id": "CR-202"}),
        ("SES-FIX-03", "CS201", ["Y2-CSE"], "FAC-01", "lecture_hall", True, {"day": "Wednesday", "start_period": 3, "room_id": "LH-102"}),
        ("SES-FIX-04", "EC201", ["Y2-ECE"], "FAC-09", "lecture_hall", False, {"day": "Thursday", "start_period": 4, "room_id": "LH-103"}),
        ("SES-FIX-05", "CS301", ["Y3-CSE"], "FAC-05", "lecture_hall", True, {"day": "Friday", "start_period": 5, "room_id": "LT-101"}),
    ]
    for sid, cid, groups, fac, rtype, needs_acc, fslot in fixed_defs:
        sessions.append({
            "session_id": sid,
            "course_id": cid,
            "session_type": "lecture",
            "duration": 1,
            "student_groups": groups,
            "faculty_id": fac,
            "required_room_type": rtype,
            "needs_accessible_room": needs_acc,
            "fixed_slot": fslot,
            "elective_basket": None
        })

    # 4 Elective Basket Sessions:
    # Basket PE-BASKET-A: EL301 and EL302 for Y3-CSE (students pick one; both run at same day/period, no clash)
    # Basket PE-BASKET-B: EL303 and EL304 for Y3-ME
    elective_defs = [
        ("SES-ELEC-01", "EL301", ["Y3-CSE"], "FAC-07", "classroom", True, "PE-BASKET-A"),
        ("SES-ELEC-02", "EL302", ["Y3-CSE"], "FAC-08", "classroom", False, "PE-BASKET-A"),
        ("SES-ELEC-03", "EL303", ["Y3-ME"], "FAC-19", "classroom", True, "PE-BASKET-B"),
        ("SES-ELEC-04", "EL304", ["Y3-ME"], "FAC-38", "classroom", False, "PE-BASKET-B"),
    ]
    for sid, cid, groups, fac, rtype, needs_acc, basket in elective_defs:
        sessions.append({
            "session_id": sid,
            "course_id": cid,
            "session_type": "lecture",
            "duration": 1,
            "student_groups": groups,
            "faculty_id": fac,
            "required_room_type": rtype,
            "needs_accessible_room": needs_acc,
            "fixed_slot": None,
            "elective_basket": basket
        })

    # Remaining 1-hour sessions to make exactly 162 1-hour sessions:
    # 4 + 5 + 4 = 13 done. Remaining = 162 - 13 = 149 sessions.
    # Distribute 149 sessions smoothly across the 14 groups and 40 faculty.
    rem_count = 149
    # Build list of candidate courses per group
    group_courses = {
        "Y1-SecA": ["CS101", "EE101", "ME101", "CH101", "EV101"],
        "Y1-SecB": ["CS101", "EE101", "ME101", "CH101", "EV101"],
        "Y1-SecC": ["CS101", "EE101", "PH101", "MA101", "EV101"],
        "Y1-SecD": ["CS101", "EE101", "PH101", "MA101", "EV101"],
        "Y2-CSE": ["CS201", "CS202", "CS203", "CS204", "CS205"],
        "Y2-ECE": ["EC201", "EC202", "EC203", "EC204", "EC205"],
        "Y2-ME":  ["ME201", "ME202", "ME203", "ME204", "ME205"],
        "Y2-CE":  ["CE201", "CE202", "CE203", "CE204", "CE205"],
        "Y2-EE":  ["EE201", "EE202", "EE203", "EE204", "EE205"],
        "Y3-CSE": ["CS301", "CS302", "CS303", "CS304", "CS305"],
        "Y3-ECE": ["EC301", "EC302", "EC303", "EC304", "EC305"],
        "Y3-ME":  ["ME301", "ME302", "ME303", "ME304", "ME305"],
        "Y3-CE":  ["CE301", "CE302", "CE303", "CE304", "CE305"],
        "Y3-EE":  ["EE301", "EE302", "EE303", "EE304", "EE305"],
    }
    
    # Faculty map for courses
    course_fac = {
        "CS101": "FAC-01", "EE101": "FAC-24", "ME101": "FAC-15", "CH101": "FAC-33", "EV101": "FAC-39",
        "PH101": "FAC-31", "MA101": "FAC-30",
        "CS201": "FAC-02", "CS202": "FAC-03", "CS203": "FAC-04", "CS204": "FAC-05", "CS205": "FAC-06",
        "EC201": "FAC-09", "EC202": "FAC-10", "EC203": "FAC-11", "EC204": "FAC-12", "EC205": "FAC-13",
        "ME201": "FAC-15", "ME202": "FAC-16", "ME203": "FAC-17", "ME204": "FAC-18", "ME205": "FAC-19",
        "CE201": "FAC-20", "CE202": "FAC-21", "CE203": "FAC-22", "CE204": "FAC-23", "CE205": "FAC-39",
        "EE201": "FAC-24", "EE202": "FAC-25", "EE203": "FAC-26", "EE204": "FAC-27", "EE205": "FAC-14",
        "CS301": "FAC-07", "CS302": "FAC-08", "CS303": "FAC-37", "CS304": "FAC-01", "CS305": "FAC-02",
        "EC301": "FAC-09", "EC302": "FAC-10", "EC303": "FAC-11", "EC304": "FAC-12", "EC305": "FAC-13",
        "ME301": "FAC-16", "ME302": "FAC-17", "ME303": "FAC-18", "ME304": "FAC-19", "ME305": "FAC-38",
        "CE301": "FAC-20", "CE302": "FAC-21", "CE303": "FAC-22", "CE304": "FAC-23", "CE305": "FAC-39",
        "EE301": "FAC-24", "EE302": "FAC-25", "EE303": "FAC-26", "EE304": "FAC-27", "EE305": "FAC-14",
    }

    g_keys = list(group_courses.keys())
    for i in range(rem_count):
        sid = f"SES-LEC-{i+1:03d}"
        grp = g_keys[i % len(g_keys)]
        clist = group_courses[grp]
        cid = clist[(i // len(g_keys)) % len(clist)]
        fac = course_fac.get(cid, "FAC-01")
        rtype = "lecture_hall" if (i % 2 == 0) else "classroom"
        needs_acc = (i % 5 == 0)

        sessions.append({
            "session_id": sid,
            "course_id": cid,
            "session_type": "lecture",
            "duration": 1,
            "student_groups": [grp],
            "faculty_id": fac,
            "required_room_type": rtype,
            "needs_accessible_room": needs_acc,
            "fixed_slot": None,
            "elective_basket": None
        })

    assert len(sessions) == 189, f"Expected 189 sessions, got {len(sessions)}"
    total_teaching_hours = sum(s["duration"] for s in sessions)
    assert total_teaching_hours == 243, f"Expected 243 hours, got {total_teaching_hours}"

    # 6. Spectra Week Booking Requests (25 requests: English & Hinglish, across priority tiers, 1 cancelled)
    # Priority tiers: 3. Institute events > 4. Guest lectures > 5. Department events > 6. Club events
    spectra_bookings = [
        # Institute Events (Priority 3)
        {
            "booking_id": "REQ-01",
            "title": "Spectra Tech Fest Grand Inauguration",
            "requested_by": "Convener, Spectra 2026",
            "role": "Admin",
            "priority_tier": 3,
            "priority_name": "institute_event",
            "day": "Wednesday",
            "start_period": 10,
            "end_period": 13,
            "preferred_room": "AUD-01",
            "expected_attendees": 280,
            "language": "en",
            "original_text": "Need the Main Auditorium on Wednesday evening from 6 PM to 10 PM for the official Spectra opening ceremony with chief guest.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-02",
            "title": "Annual Inter-College RoboWars Championship",
            "requested_by": "Robotics Society",
            "role": "Department coordinator",
            "priority_tier": 3,
            "priority_name": "institute_event",
            "day": "Thursday",
            "start_period": 10,
            "end_period": 13,
            "preferred_room": "OAT-01",
            "expected_attendees": 350,
            "language": "en",
            "original_text": "Requesting Open Air Theatre for RoboWars combat arena setup on Thursday 18:00 to 22:00.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-03",
            "title": "Spectra Valedictory & Prize Distribution",
            "requested_by": "Dean Student Affairs",
            "role": "Admin",
            "priority_tier": 3,
            "priority_name": "institute_event",
            "day": "Friday",
            "start_period": 10,
            "end_period": 13,
            "preferred_room": "AUD-01",
            "expected_attendees": 300,
            "language": "en",
            "original_text": "Main Auditorium booking for closing ceremony and award distribution on Friday 6 PM to 10 PM.",
            "status": "pending"
        },

        # Guest Lectures (Priority 4)
        {
            "booking_id": "REQ-04",
            "title": "Keynote: Generative AI at Cloud Scale",
            "requested_by": "Prof. Sneha Reddy",
            "role": "Faculty",
            "priority_tier": 4,
            "priority_name": "guest_lecture",
            "day": "Tuesday",
            "start_period": 6,
            "end_period": 7,
            "preferred_room": "LT-101",
            "expected_attendees": 140,
            "language": "en",
            "original_text": "Distinguished lecture by Google DeepMind VP on Tuesday afternoon 14:00 to 16:00 in Grand Lecture Theatre.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-05",
            "title": "Industry Talk: Semiconductor Fab in India",
            "requested_by": "Dr. Arjun Gupta",
            "role": "Faculty",
            "priority_tier": 4,
            "priority_name": "guest_lecture",
            "day": "Wednesday",
            "start_period": 6,
            "end_period": 7,
            "preferred_room": "SH-201",
            "expected_attendees": 80,
            "language": "hinglish",
            "original_text": "Sir, Wednesday afternoon 2 se 4 PM Vikram Sarabhai hall mein industry experts semiconductor fab par session lenge.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-06",
            "title": "Guest Lecture: Electric Vehicle Powertrain Architecture",
            "requested_by": "Dr. Rohan Bhatt",
            "role": "Faculty",
            "priority_tier": 4,
            "priority_name": "guest_lecture",
            "day": "Thursday",
            "start_period": 7,
            "end_period": 8,
            "preferred_room": "SH-202",
            "expected_attendees": 75,
            "language": "hinglish",
            "original_text": "Tata Motors chief engineer Thursday 3 PM to 5 PM lecture denge, please SH-202 book kar do.",
            "status": "pending"
        },

        # Department Events (Priority 5)
        {
            "booking_id": "REQ-07",
            "title": "HackCIT: 24-Hour Hackathon Mentoring Session",
            "requested_by": "CSE Department Coordinator",
            "role": "Department coordinator",
            "priority_tier": 5,
            "priority_name": "department_event",
            "day": "Wednesday",
            "start_period": 10,
            "end_period": 12,
            "preferred_room": "LAB-CS1",
            "expected_attendees": 65,
            "language": "en",
            "original_text": "Need Computing Lab 1 on Wednesday evening 18:00 to 21:00 for hackathon teams project checkpoint.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-08",
            "title": "VLSI Circuit Design Speedrun Challenge",
            "requested_by": "ECE Society",
            "role": "Department coordinator",
            "priority_tier": 5,
            "priority_name": "department_event",
            "day": "Thursday",
            "start_period": 10,
            "end_period": 12,
            "preferred_room": "LAB-ECE",
            "expected_attendees": 40,
            "language": "hinglish",
            "original_text": "Thursday sham ko 6 baje se 8 baje tak ECE lab chahiye circuit design competition ke liye.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-09",
            "title": "CADathon Design Sprint",
            "requested_by": "Mechanical & Civil Society",
            "role": "Department coordinator",
            "priority_tier": 5,
            "priority_name": "department_event",
            "day": "Friday",
            "start_period": 6,
            "end_period": 8,
            "preferred_room": "LAB-CIVIL",
            "expected_attendees": 40,
            "language": "en",
            "original_text": "Booking request for Civil CAD Lab Friday 2 PM to 5 PM for 3D modelling design sprint.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-10",
            "title": "Dept Colloquium: Recent Advances in Power Grid",
            "requested_by": "EE Dept Head",
            "role": "Department coordinator",
            "priority_tier": 5,
            "priority_name": "department_event",
            "day": "Monday",
            "start_period": 6,
            "end_period": 7,
            "preferred_room": "SH-201",
            "expected_attendees": 70,
            "language": "en",
            "original_text": "Department presentation session in Seminar Hall North on Monday 14:00 to 16:00.",
            "status": "pending"
        },

        # Club Events (Priority 6)
        {
            "booking_id": "REQ-11",
            "title": "Music Club Acoustic Night Rehearsal",
            "requested_by": "Dhwani Music Club Lead",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Monday",
            "start_period": 10,
            "end_period": 12,
            "preferred_room": "OAT-01",
            "expected_attendees": 150,
            "language": "hinglish",
            "original_text": "Monday ko 6 baje se OAT chahiye band practice ke liye, sound check karna hai.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-12",
            "title": "Dance Society Flashmob Rehearsal",
            "requested_by": "Natraj Dance Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Tuesday",
            "start_period": 10,
            "end_period": 12,
            "preferred_room": "AUD-01",
            "expected_attendees": 80,
            "language": "hinglish",
            "original_text": "Kal sham 6 to 8 PM auditorium mil sakta hai kya? Dance fest choreography practice karni hai.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-13",
            "title": "Esports LAN Tournament: Valorant & CS2",
            "requested_by": "CIT Gaming Guild",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Thursday",
            "start_period": 10,
            "end_period": 13,
            "preferred_room": "LAB-CS2",
            "expected_attendees": 60,
            "language": "en",
            "original_text": "Need Ada Lovelace Computer Lab on Thursday 6 PM to 10 PM for campus LAN tournament qualifiers.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-14",
            "title": "Literary & Debate Parliamentary Mock",
            "requested_by": "Debating Society",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Wednesday",
            "start_period": 6,
            "end_period": 8,
            "preferred_room": "SH-202",
            "expected_attendees": 50,
            "language": "en",
            "original_text": "Booking SH-202 on Wednesday afternoon 14:00 to 17:00 for mock parliament session.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-15",
            "title": "Photography Exhibition Setup",
            "requested_by": "Iris Aperture Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Tuesday",
            "start_period": 6,
            "end_period": 9,
            "preferred_room": "SH-201",
            "expected_attendees": 40,
            "language": "hinglish",
            "original_text": "Photo gallery lagani hai Tuesday ko afternoon session mein Seminar hall mein.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-16",
            "title": "Astronomy Club Stargazing Night",
            "requested_by": "Cosmos Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Friday",
            "start_period": 10,
            "end_period": 13,
            "preferred_room": "OAT-01",
            "expected_attendees": 200,
            "language": "en",
            "original_text": "Friday 18:00 to 22:00 at Open Air Theatre for telescope observation session.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-17",
            "title": "AI & Robotics Workshop for Freshers",
            "requested_by": "ACM Student Chapter",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Monday",
            "start_period": 6,
            "end_period": 8,
            "preferred_room": "LH-102",
            "expected_attendees": 85,
            "language": "hinglish",
            "original_text": "Monday 2 se 5 PM ek workshop conduct karni hai 1st year walon ke liye LH-102 mein.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-18",
            "title": "Drama Society Street Play Prep",
            "requested_by": "Abhinay Dramatics",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Wednesday",
            "start_period": 7,
            "end_period": 9,
            "preferred_room": "OAT-01",
            "expected_attendees": 60,
            "language": "hinglish",
            "original_text": "Nukkad natak rehearsal Wednesday 3 PM se 6 PM tak amphitheatre par karni hai.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-19",
            "title": "Web3 & Blockchain Hands-on Bootcamp",
            "requested_by": "Blockchain Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Tuesday",
            "start_period": 7,
            "end_period": 9,
            "preferred_room": "LAB-CS1",
            "expected_attendees": 60,
            "language": "en",
            "original_text": "Smart contract deployment workshop in Computer Lab 1 on Tuesday 15:00 to 18:00.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-20",
            "title": "Anime & Graphic Arts Showcase",
            "requested_by": "Creative Arts Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Thursday",
            "start_period": 6,
            "end_period": 8,
            "preferred_room": "CR-201",
            "expected_attendees": 45,
            "language": "hinglish",
            "original_text": "Thursday dopahar 2 to 4 PM CR-201 chahiye digital art display ke liye.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-21",
            "title": "Formula Student Chassis Review",
            "requested_by": "SAE Collegiate Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Monday",
            "start_period": 10,
            "end_period": 12,
            "preferred_room": "LAB-MECH",
            "expected_attendees": 35,
            "language": "en",
            "original_text": "Late night chassis welding and inspection in Mechanical Workshop Monday 18:00 to 21:00.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-22",
            "title": "Quiz Society Spectra Prelims",
            "requested_by": "CIT Quiz Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Thursday",
            "start_period": 6,
            "end_period": 7,
            "preferred_room": "LH-103",
            "expected_attendees": 80,
            "language": "hinglish",
            "original_text": "General quiz prelims Thursday 2 se 3 baje tak LH-103 mein organise karna chahte hain.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-23",
            "title": "Eco Club Green Campus Forum",
            "requested_by": "Prakriti Eco Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Friday",
            "start_period": 6,
            "end_period": 7,
            "preferred_room": "CR-202",
            "expected_attendees": 50,
            "language": "en",
            "original_text": "Sustainability roundtable discussion on Friday 14:00 to 16:00 in Classroom 202.",
            "status": "pending"
        },
        {
            "booking_id": "REQ-24",
            "title": "Drone Racing League Obstacle Setup",
            "requested_by": "Aero Club",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Wednesday",
            "start_period": 10,
            "end_period": 13,
            "preferred_room": "OAT-01",
            "expected_attendees": 120,
            "language": "hinglish",
            "original_text": "Wednesday raat ko drone hurdles setup karne hain OAT mein.",
            "status": "pending"
        },
        # Cancelled Request (1)
        {
            "booking_id": "REQ-25",
            "title": "Standup Comedy Night Prelims (CANCELLED)",
            "requested_by": "Cultural Council",
            "role": "Club representative",
            "priority_tier": 6,
            "priority_name": "club_event",
            "day": "Tuesday",
            "start_period": 10,
            "end_period": 12,
            "preferred_room": "AUD-01",
            "expected_attendees": 200,
            "language": "hinglish",
            "original_text": "Tuesday ko standup comedy round chahiye tha but artist unavailable hai abhi cancel kar rahe hain.",
            "status": "cancelled"
        }
    ]
    assert len(spectra_bookings) == 25, f"Expected 25 booking requests, got {len(spectra_bookings)}"
    assert sum(1 for b in spectra_bookings if b["status"] == "cancelled") == 1, "Expected exactly 1 cancelled request"

    # 7. Midsem Exams: EXACTLY 41 exams for the following week
    # Effective capacity is halved during exams (effective_capacity = room.capacity // 2).
    # Student groups can have at most 1 exam per day.
    # Exams run Monday to Friday in Exam Period Slots:
    # Slot 1: P2 to P4 (09:00 - 12:00)
    # Slot 2: P6 to P8 (14:00 - 17:00)
    midsem_exams = []
    exam_specs = [
        # Y1 Exams (8 courses: MA101, PH101, CH101, CS101, ME101, EE101, HS101, EV101)
        # Each for 4 sections A, B, C, D (divided into cohorts)
        ("EXAM-01", "MA101", ["Y1-SecA", "Y1-SecB"], 3, 120, "Monday", 2),
        ("EXAM-02", "MA101", ["Y1-SecC", "Y1-SecD"], 3, 120, "Monday", 6),
        ("EXAM-03", "PH101", ["Y1-SecA", "Y1-SecB"], 3, 120, "Tuesday", 2),
        ("EXAM-04", "PH101", ["Y1-SecC", "Y1-SecD"], 3, 120, "Tuesday", 6),
        ("EXAM-05", "CS101", ["Y1-SecA", "Y1-SecB"], 3, 120, "Wednesday", 2),
        ("EXAM-06", "CS101", ["Y1-SecC", "Y1-SecD"], 3, 120, "Wednesday", 6),
        ("EXAM-07", "ME101", ["Y1-SecA", "Y1-SecC"], 3, 120, "Thursday", 2),
        ("EXAM-08", "EE101", ["Y1-SecB", "Y1-SecD"], 3, 120, "Thursday", 6),
        ("EXAM-09", "HS101", ["Y1-SecA", "Y1-SecB", "Y1-SecC", "Y1-SecD"], 2, 240, "Friday", 2),

        # Y2 CSE Exams (5)
        ("EXAM-10", "CS201", ["Y2-CSE"], 3, 65, "Monday", 2),
        ("EXAM-11", "CS202", ["Y2-CSE"], 3, 65, "Tuesday", 2),
        ("EXAM-12", "CS203", ["Y2-CSE"], 3, 65, "Wednesday", 2),
        ("EXAM-13", "CS204", ["Y2-CSE"], 3, 65, "Thursday", 2),
        ("EXAM-14", "CS205", ["Y2-CSE"], 3, 65, "Friday", 2),

        # Y2 ECE Exams (4)
        ("EXAM-15", "EC201", ["Y2-ECE"], 3, 60, "Monday", 6),
        ("EXAM-16", "EC202", ["Y2-ECE"], 3, 60, "Tuesday", 6),
        ("EXAM-17", "EC203", ["Y2-ECE"], 3, 60, "Wednesday", 6),
        ("EXAM-18", "EC204", ["Y2-ECE"], 3, 60, "Thursday", 6),

        # Y2 ME Exams (4)
        ("EXAM-19", "ME201", ["Y2-ME"], 3, 55, "Monday", 2),
        ("EXAM-20", "ME202", ["Y2-ME"], 3, 55, "Tuesday", 2),
        ("EXAM-21", "ME203", ["Y2-ME"], 3, 55, "Wednesday", 2),
        ("EXAM-22", "ME204", ["Y2-ME"], 3, 55, "Thursday", 2),

        # Y2 CE Exams (3)
        ("EXAM-23", "CE201", ["Y2-CE"], 3, 50, "Monday", 6),
        ("EXAM-24", "CE202", ["Y2-CE"], 3, 50, "Tuesday", 6),
        ("EXAM-25", "CE203", ["Y2-CE"], 3, 50, "Wednesday", 6),

        # Y2 EE Exams (3)
        ("EXAM-26", "EE201", ["Y2-EE"], 3, 50, "Monday", 2),
        ("EXAM-27", "EE202", ["Y2-EE"], 3, 50, "Tuesday", 2),
        ("EXAM-28", "EE203", ["Y2-EE"], 3, 50, "Wednesday", 2),

        # Y3 CSE Exams (4)
        ("EXAM-29", "CS301", ["Y3-CSE"], 3, 65, "Monday", 6),
        ("EXAM-30", "CS302", ["Y3-CSE"], 3, 65, "Tuesday", 6),
        ("EXAM-31", "CS303", ["Y3-CSE"], 3, 65, "Wednesday", 6),
        ("EXAM-32", "CS304", ["Y3-CSE"], 3, 65, "Thursday", 6),

        # Y3 ECE Exams (3)
        ("EXAM-33", "EC301", ["Y3-ECE"], 3, 60, "Monday", 2),
        ("EXAM-34", "EC302", ["Y3-ECE"], 3, 60, "Tuesday", 2),
        ("EXAM-35", "EC303", ["Y3-ECE"], 3, 60, "Wednesday", 2),

        # Y3 ME Exams (3)
        ("EXAM-36", "ME301", ["Y3-ME"], 3, 55, "Monday", 6),
        ("EXAM-37", "ME302", ["Y3-ME"], 3, 55, "Tuesday", 6),
        ("EXAM-38", "ME303", ["Y3-ME"], 3, 55, "Wednesday", 6),

        # Y3 CE Exams (2)
        ("EXAM-39", "CE301", ["Y3-CE"], 3, 50, "Thursday", 2),
        ("EXAM-40", "CE302", ["Y3-CE"], 3, 50, "Friday", 6),

        # Y3 EE Exams (1)
        ("EXAM-41", "EE301", ["Y3-EE"], 3, 50, "Friday", 6),
    ]
    assert len(exam_specs) == 41, f"Expected 41 exams, got {len(exam_specs)}"

    for eid, cid, grps, dur, att, day, start_p in exam_specs:
        midsem_exams.append({
            "exam_id": eid,
            "course_id": cid,
            "student_groups": grps,
            "duration": dur,
            "expected_students": att,
            "suggested_day": day,
            "suggested_start_period": start_p
        })

    # Assemble cit_public.json master dictionary
    cit_public_data = {
        "metadata": {
            "institution": "Chilika Institute of Technology (CIT)",
            "academic_year": "2026-2027",
            "semester": "Odd (Week 7 Spectra Week & Midsems)",
            "rooms_count": len(rooms),
            "faculty_count": len(faculty),
            "student_groups_count": len(student_groups),
            "courses_count": len(courses),
            "sessions_count": len(sessions),
            "total_teaching_hours": total_teaching_hours,
            "spectra_bookings_count": len(spectra_bookings),
            "midsem_exams_count": len(midsem_exams)
        },
        "days": days,
        "periods": {
            "teaching_periods": [1, 2, 3, 4, 5, 6, 7, 8, 9],
            "lunch_window": {"between_periods": [5, 6], "time": "13:00 - 14:00"},
            "event_periods": [10, 11, 12, 13]
        },
        "rooms": rooms,
        "faculty": faculty,
        "student_groups": student_groups,
        "courses": courses,
        "sessions": sessions,
        "spectra_bookings": spectra_bookings,
        "midsem_exams": midsem_exams
    }

    # Write cit_public.json
    cit_path = os.path.join(official_dir, "cit_public.json")
    with open(cit_path, "w", encoding="utf-8") as f:
        json.dump(cit_public_data, f, indent=2)
    print(f"Generated {cit_path}")

    # Generate CSVs for spreadsheet viewing
    for entity in ["rooms", "faculty", "student_groups", "courses", "sessions", "spectra_bookings", "midsem_exams"]:
        csv_file = os.path.join(csv_dir, f"{entity}.csv")
        data_list = cit_public_data[entity]
        if data_list:
            keys = list(data_list[0].keys())
            with open(csv_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                for row in data_list:
                    # serialize nested structures
                    flat_row = {}
                    for k, v in row.items():
                        if isinstance(v, (list, dict)):
                            flat_row[k] = json.dumps(v)
                        else:
                            flat_row[k] = v
                    writer.writerow(flat_row)
            print(f"Generated {csv_file}")

    # 8. sample_disruption.json
    disruption = {
        "disruption_id": "DISRUPT-CIT-W7",
        "description": "Mid-week emergency changes: Faculty medical leave, unexpected room maintenance, and urgent guest workshop addition.",
        "changes": [
            {
                "type": "faculty_leave",
                "faculty_id": "FAC-05",
                "faculty_name": "Dr. Amit Patel",
                "day": "Wednesday",
                "reason": "Emergency medical leave"
            },
            {
                "type": "room_closure",
                "room_id": "LH-104",
                "day": "Thursday",
                "periods": [1, 2, 3, 4, 5, 6, 7, 8, 9],
                "reason": "HVAC system breakdown and ceiling repair"
            },
            {
                "type": "add_session",
                "session": {
                    "session_id": "SES-NEW-01",
                    "course_id": "CS304",
                    "session_type": "lecture",
                    "duration": 1,
                    "student_groups": ["Y3-CSE"],
                    "faculty_id": "FAC-01",
                    "required_room_type": "lecture_hall",
                    "needs_accessible_room": True,
                    "fixed_slot": None,
                    "elective_basket": None,
                    "reason": "Special IEEE AI Ethics & Alignment lecture"
                }
            }
        ]
    }
    disruption_path = os.path.join(official_dir, "sample_disruption.json")
    with open(disruption_path, "w", encoding="utf-8") as f:
        json.dump(disruption, f, indent=2)
    print(f"Generated {disruption_path}")


if __name__ == "__main__":
    generate_all()
