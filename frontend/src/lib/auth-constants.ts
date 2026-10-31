export type RoleType =
  | "Admin (Dean's office)"
  | "Department coordinator"
  | "Faculty"
  | "Club representative"
  | "timetable_coordinator"
  | "academic_dean"
  | "venue_manager"
  | "faculty"
  | "student_representative"
  | "super_admin";

export interface Persona {
  id: string;
  name: string;
  role: RoleType;
  label: string;
  email: string;
  password?: string;
  department: string;
  avatar: string;
  badge: string;
  badgeVariant: "cit" | "secondary" | "outline" | "warning" | "gold" | "rose" | "brown";
  canApprove: boolean;
  canChangePriority: boolean;
  canGenerateTimetable: boolean;
  canMoveClasses: boolean;
  canReschedule: boolean;
  canManualSchedule: boolean;
  canViewApprovals: boolean;
  canViewFaculty: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  whatTheyCanDo: string;
}

export const DEMO_ROLES: Persona[] = [
  // 4 Primary Roles Specified in Section 4
  {
    id: "DEAN-01",
    name: "Prof. S. Mohapatra",
    role: "Admin (Dean's office)",
    label: "Admin (Dean's office)",
    email: "dean@cit.edu.in",
    password: "Dean@2026",
    department: "Dean's Office (Academic Affairs)",
    avatar: "SM",
    badge: "Super Admin",
    badgeVariant: "cit",
    canApprove: true,
    canChangePriority: true,
    canGenerateTimetable: true,
    canMoveClasses: true,
    canReschedule: true,
    canManualSchedule: true,
    canViewApprovals: true,
    canViewFaculty: true,
    canViewAnalytics: true,
    canManageSettings: true,
    whatTheyCanDo:
      "Everything. Generates the timetable, approves timetable changes and any booking that moves a class, can change the priority order.",
  },
  {
    id: "COORD-CSE",
    name: "Dr. A. Verma",
    role: "Department coordinator",
    label: "Department coordinator",
    email: "coordinator.cse@cit.edu.in",
    password: "Coord@2026",
    department: "Computer Science & Engineering",
    avatar: "AV",
    badge: "Dept Coordinator",
    badgeVariant: "gold",
    canApprove: true,
    canChangePriority: false,
    canGenerateTimetable: true,
    canMoveClasses: true,
    canReschedule: true,
    canManualSchedule: true,
    canViewApprovals: true,
    canViewFaculty: true,
    canViewAnalytics: true,
    canManageSettings: false,
    whatTheyCanDo:
      "Requests changes to their department's sessions, books rooms for department events, approves bookings of their department's labs.",
  },
  {
    id: "FAC-01",
    name: "Dr. Rajesh Sharma",
    role: "Faculty",
    label: "Faculty",
    email: "fac01@cit.edu.in",
    password: "Faculty@2026",
    department: "Computer Science & Engineering",
    avatar: "RS",
    badge: "Faculty Member",
    badgeVariant: "outline",
    canApprove: false,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    canReschedule: false,
    canManualSchedule: false,
    canViewApprovals: false,
    canViewFaculty: true,
    canViewAnalytics: false,
    canManageSettings: false,
    whatTheyCanDo:
      "Views their own timetable, marks unavailability, requests extra or moved sessions.",
  },
  {
    id: "CLUB-LIT-01",
    name: "Aarav Patel",
    role: "Club representative",
    label: "Club representative",
    email: "club.lit@cit.edu.in",
    password: "Club@2026",
    department: "Literary Society (Spectra Committee)",
    avatar: "AP",
    badge: "Club Representative",
    badgeVariant: "warning",
    canApprove: false,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    canReschedule: false,
    canManualSchedule: false,
    canViewApprovals: false,
    canViewFaculty: false,
    canViewAnalytics: false,
    canManageSettings: false,
    whatTheyCanDo:
      "Submits and cancels venue requests, and sees the status and reason for each.",
  },

  // Supporting Personas & Aliases for routinetable.vercel.app simulation
  {
    id: "timetable_coordinator",
    name: "Dr. Priya Sharma",
    role: "timetable_coordinator",
    label: "Timetable Coordinator",
    email: "coordinator@chitkara.edu.in",
    password: "Coord@2026",
    department: "Computer Science & Engineering",
    avatar: "PS",
    badge: "Primary Actor",
    badgeVariant: "gold",
    canApprove: true,
    canChangePriority: false,
    canGenerateTimetable: true,
    canMoveClasses: true,
    canReschedule: true,
    canManualSchedule: true,
    canViewApprovals: true,
    canViewFaculty: true,
    canViewAnalytics: true,
    canManageSettings: false,
    whatTheyCanDo:
      "Generates master timetable, resolves clashes, adjusts allocations, and coordinates department sessions.",
  },
  {
    id: "academic_dean",
    name: "Prof. S.K. Mehta",
    role: "academic_dean",
    label: "Academic Dean",
    email: "dean@chitkara.edu.in",
    password: "Dean@2026",
    department: "Dean's Office (Academic Affairs)",
    avatar: "SM",
    badge: "Approver",
    badgeVariant: "cit",
    canApprove: true,
    canChangePriority: true,
    canGenerateTimetable: true,
    canMoveClasses: true,
    canReschedule: true,
    canManualSchedule: true,
    canViewApprovals: true,
    canViewFaculty: true,
    canViewAnalytics: true,
    canManageSettings: true,
    whatTheyCanDo:
      "Final authority on academic schedules, exam policies, priority order reordering, and governance overrides.",
  },
  {
    id: "venue_manager",
    name: "Mr. Rajan Singh",
    role: "venue_manager",
    label: "Venue Manager",
    email: "venues@chitkara.edu.in",
    password: "Venue@2026",
    department: "Campus Infrastructure & Venues",
    avatar: "RS",
    badge: "Spectra",
    badgeVariant: "rose",
    canApprove: true,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    canReschedule: false,
    canManualSchedule: false,
    canViewApprovals: true,
    canViewFaculty: false,
    canViewAnalytics: true,
    canManageSettings: false,
    whatTheyCanDo:
      "Reviews Spectra fest reservations, auditorium requests, venue conflicts, and maintenance blockouts.",
  },
  {
    id: "faculty_chitkara",
    name: "Dr. Amit Behera",
    role: "faculty",
    label: "Faculty Member",
    email: "faculty@chitkara.edu.in",
    password: "Faculty@2026",
    department: "ECE",
    avatar: "AB",
    badge: "Instructor",
    badgeVariant: "outline",
    canApprove: false,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    canReschedule: false,
    canManualSchedule: false,
    canViewApprovals: false,
    canViewFaculty: true,
    canViewAnalytics: false,
    canManageSettings: false,
    whatTheyCanDo:
      "Views personal teaching timetable, marks unavailability, and requests rescheduled extra sessions.",
  },
  {
    id: "student_representative",
    name: "Arjun Patel",
    role: "student_representative",
    label: "Student Rep",
    email: "student@chitkara.edu.in",
    password: "Student@2026",
    department: "CSE",
    avatar: "AP",
    badge: "Viewer",
    badgeVariant: "secondary",
    canApprove: false,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    canReschedule: false,
    canManualSchedule: false,
    canViewApprovals: false,
    canViewFaculty: false,
    canViewAnalytics: false,
    canManageSettings: false,
    whatTheyCanDo:
      "Submits venue bookings for student society events and tracks approval status and audit reasons.",
  },
  {
    id: "super_admin",
    name: "Dr. Rajiv Kumar",
    role: "super_admin",
    label: "Super Admin",
    email: "admin@chitkara.edu.in",
    password: "Admin@2026",
    department: "Central Administration",
    avatar: "RK",
    badge: "Admin",
    badgeVariant: "brown",
    canApprove: true,
    canChangePriority: true,
    canGenerateTimetable: true,
    canMoveClasses: true,
    canReschedule: true,
    canManualSchedule: true,
    canViewApprovals: true,
    canViewFaculty: true,
    canViewAnalytics: true,
    canManageSettings: true,
    whatTheyCanDo:
      "Complete platform control across system settings, user permissions, audit trails, and data resets.",
  },
];

export const OFFICIAL_PERSONAS = DEMO_ROLES;
