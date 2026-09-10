export interface Department {
  id: string; // e.g. "cse", "ece", "it", "mech", "civil", "eee", "csit", "aids"
  name: string; // e.g. "Computer Science & Engineering"
  shortName: string; // e.g. "CSE"
  code: string; // e.g. "05"
  description: string;
  icon?: string;
  color?: string;
}

export const DEPARTMENTS: Department[] = [
  {
    id: "cse",
    name: "Computer Science & Engineering",
    shortName: "CSE",
    code: "05",
    description: "Department of Computer Science & Engineering",
    color: "indigo",
  },
  {
    id: "ece",
    name: "Electronics & Communication Engineering",
    shortName: "ECE",
    code: "04",
    description: "Department of Electronics & Communication Engineering",
    color: "cyan",
  },
  {
    id: "it",
    name: "Information Technology",
    shortName: "IT",
    code: "12",
    description: "Department of Information Technology",
    color: "blue",
  },
  {
    id: "aids",
    name: "Artificial Intelligence & Data Science",
    shortName: "AI & DS",
    code: "67",
    description: "Department of Artificial Intelligence & Data Science",
    color: "purple",
  },
  {
    id: "csit",
    name: "Computer Science & Information Technology",
    shortName: "CSIT",
    code: "33",
    description: "Department of Computer Science & Information Technology",
    color: "violet",
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    shortName: "MECH",
    code: "03",
    description: "Department of Mechanical Engineering",
    color: "amber",
  },
  {
    id: "civil",
    name: "Civil Engineering",
    shortName: "CIVIL",
    code: "01",
    description: "Department of Civil Engineering",
    color: "emerald",
  },
  {
    id: "eee",
    name: "Electrical & Electronics Engineering",
    shortName: "EEE",
    code: "02",
    description: "Department of Electrical & Electronics Engineering",
    color: "yellow",
  },
];

/**
 * Maps a user's department name string (from User.department) to a standardized department ID (slug).
 * Returns undefined if user has no department or department is not recognized.
 */
export function getDepartmentId(departmentName?: string | null): string | undefined {
  if (!departmentName) return undefined;
  const normalized = departmentName.toLowerCase().trim();

  // Direct match by ID
  const directMatch = DEPARTMENTS.find((d) => d.id === normalized);
  if (directMatch) return directMatch.id;

  // Match by shortName (e.g. "CSE")
  const shortMatch = DEPARTMENTS.find((d) => d.shortName.toLowerCase() === normalized);
  if (shortMatch) return shortMatch.id;

  // Match by full name
  const nameMatch = DEPARTMENTS.find((d) => d.name.toLowerCase() === normalized);
  if (nameMatch) return nameMatch.id;

  // Fuzzy substring matches
  if (normalized.includes("computer science") || normalized.includes("cse")) return "cse";
  if (normalized.includes("electronics") || normalized.includes("communication") || normalized.includes("ece")) return "ece";
  if (normalized.includes("information tech") || normalized.includes("it")) return "it";
  if (normalized.includes("artificial intelligence") || normalized.includes("data science") || normalized.includes("aids") || normalized.includes("ai & ds")) return "aids";
  if (normalized.includes("csit")) return "csit";
  if (normalized.includes("mechanical") || normalized.includes("mech")) return "mech";
  if (normalized.includes("civil")) return "civil";
  if (normalized.includes("electrical") || normalized.includes("eee")) return "eee";

  return undefined;
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id.toLowerCase() === id.toLowerCase());
}

export function getDepartmentLabel(idOrName?: string | null): string {
  if (!idOrName) return "All Departments";
  const deptId = getDepartmentId(idOrName) || idOrName;
  const dept = getDepartmentById(deptId);
  return dept ? dept.name : idOrName;
}

export function getDepartmentShortLabel(idOrName?: string | null): string {
  if (!idOrName) return "ALL";
  const deptId = getDepartmentId(idOrName) || idOrName;
  const dept = getDepartmentById(deptId);
  return dept ? dept.shortName : idOrName.toUpperCase();
}
