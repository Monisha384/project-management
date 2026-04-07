export type ProjectStatus = "Planned" | "In Progress" | "Completed";

export type UserRecord = {
  id: string;
  name: string;
  role: string;
  workload: number;
  attendance: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
  };
  tasks: { title: string; priority: "High" | "Medium" | "Low"; dueDate: string }[];
};

export type ProjectRecord = {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  progress: number;
};

const users: UserRecord[] = [
  {
    id: "u1",
    name: "Shivani",
    role: "UI Engineer",
    workload: 70,
    attendance: { presentDays: 22, absentDays: 1, lateDays: 2 },
    tasks: [
      { title: "Finish dashboard UI", priority: "High", dueDate: "2026-04-08" },
      { title: "Design handoff", priority: "Medium", dueDate: "2026-04-10" },
    ],
  },
  {
    id: "u2",
    name: "Ravi",
    role: "Backend Engineer",
    workload: 60,
    attendance: { presentDays: 20, absentDays: 2, lateDays: 3 },
    tasks: [
      { title: "Create endpoint v2", priority: "High", dueDate: "2026-04-09" },
      { title: "Review integration", priority: "Medium", dueDate: "2026-04-12" },
    ],
  },
  {
    id: "u3",
    name: "Harini",
    role: "QA Engineer",
    workload: 40,
    attendance: { presentDays: 23, absentDays: 0, lateDays: 1 },
    tasks: [
      { title: "Write regression tests", priority: "Medium", dueDate: "2026-04-11" },
      { title: "Fix flaky cases", priority: "Low", dueDate: "2026-04-13" },
    ],
  },
  {
    id: "u4",
    name: "Harish",
    role: "Technical Writer",
    workload: 35,
    attendance: { presentDays: 21, absentDays: 1, lateDays: 2 },
    tasks: [
      { title: "Update user guide", priority: "Medium", dueDate: "2026-04-09" },
      { title: "Release notes draft", priority: "Low", dueDate: "2026-04-12" },
    ],
  },
  {
    id: "u5",
    name: "Aarthi",
    role: "Product Analyst",
    workload: 50,
    attendance: { presentDays: 22, absentDays: 1, lateDays: 1 },
    tasks: [
      { title: "Refine backlog", priority: "High", dueDate: "2026-04-10" },
      { title: "Prepare sprint goals", priority: "Medium", dueDate: "2026-04-14" },
    ],
  },
  {
    id: "u6",
    name: "Kiran",
    role: "DevOps Engineer",
    workload: 55,
    attendance: { presentDays: 21, absentDays: 1, lateDays: 2 },
    tasks: [
      { title: "Improve CI pipeline", priority: "High", dueDate: "2026-04-09" },
      { title: "Cost optimization", priority: "Medium", dueDate: "2026-04-15" },
    ],
  },
  {
    id: "u7",
    name: "Meena",
    role: "UX Researcher",
    workload: 45,
    attendance: { presentDays: 20, absentDays: 2, lateDays: 2 },
    tasks: [
      { title: "Interview users", priority: "Medium", dueDate: "2026-04-11" },
      { title: "Research summary", priority: "Low", dueDate: "2026-04-13" },
    ],
  },
  {
    id: "u8",
    name: "Suresh",
    role: "Full Stack Engineer",
    workload: 65,
    attendance: { presentDays: 22, absentDays: 1, lateDays: 1 },
    tasks: [
      { title: "Fix auth flow", priority: "High", dueDate: "2026-04-09" },
      { title: "Implement profile API", priority: "Medium", dueDate: "2026-04-14" },
    ],
  },
];

const projects: ProjectRecord[] = [
  { id: "p1", name: "Web Redesign", owner: "Shivani", status: "In Progress", progress: 68 },
  { id: "p2", name: "API Upgrade", owner: "Ravi", status: "Planned", progress: 20 },
  { id: "p3", name: "Test Automation", owner: "Harini", status: "Completed", progress: 100 },
  { id: "p4", name: "Documentation Portal", owner: "Harish", status: "In Progress", progress: 47 },
  { id: "p5", name: "Roadmap Intelligence", owner: "Aarthi", status: "Planned", progress: 18 },
  { id: "p6", name: "Cloud Reliability", owner: "Kiran", status: "In Progress", progress: 56 },
  { id: "p7", name: "UX Insights Program", owner: "Meena", status: "In Progress", progress: 42 },
];

export function getUsers(): UserRecord[] {
  return users;
}

export function getProjects(): ProjectRecord[] {
  return projects;
}

export function addProject(input: Omit<ProjectRecord, "id">): ProjectRecord {
  const project: ProjectRecord = {
    id: `p${projects.length + 1}`,
    ...input,
  };
  projects.push(project);
  return project;
}
