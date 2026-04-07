const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5009
const MONGO_URI = process.env.MONGO_URI || "";
console.log("Mongo URI:", MONGO_URI);
let useDatabase = Boolean(MONGO_URI);

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});
const seedUsers = [
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

const seedProjects = [
  { id: "p1", name: "Web Redesign", owner: "Shivani", status: "In Progress", progress: 68 },
  { id: "p2", name: "API Upgrade", owner: "Ravi", status: "Planned", progress: 20 },
  { id: "p3", name: "Test Automation", owner: "Harini", status: "Completed", progress: 100 },
  { id: "p4", name: "Documentation Portal", owner: "Harish", status: "In Progress", progress: 47 },
  { id: "p5", name: "Roadmap Intelligence", owner: "Aarthi", status: "Planned", progress: 18 },
  { id: "p6", name: "Cloud Reliability", owner: "Kiran", status: "In Progress", progress: 56 },
  { id: "p7", name: "UX Insights Program", owner: "Meena", status: "In Progress", progress: 42 },
  { id: "p8", name: "Platform Security", owner: "Suresh", status: "Planned", progress: 15 },
];

const seedReports = [
  { id: "r1", name: "Sprint Velocity", status: "Completed", owner: "Shivani" },
  { id: "r2", name: "Client Feedback", status: "Pending", owner: "Aarthi" },
  { id: "r3", name: "Budget Forecast", status: "In Review", owner: "Ravi" },
  { id: "r4", name: "Quality Audit", status: "Completed", owner: "Harini" },
  { id: "r5", name: "Security Scan", status: "Pending", owner: "Suresh" },
  { id: "r6", name: "Cloud Cost Report", status: "In Review", owner: "Kiran" },
  { id: "r7", name: "UX Findings", status: "Completed", owner: "Meena" },
];

const userSchema = new mongoose.Schema(
  {
    name: String,
    role: String,
    workload: Number,
    attendance: {
      presentDays: Number,
      absentDays: Number,
      lateDays: Number,
    },
    tasks: [{ title: String, priority: String, dueDate: String }],
  },
  { versionKey: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: String,
    owner: String,
    status: String,
    progress: Number,
  },
  { versionKey: false }
);

const reportSchema = new mongoose.Schema(
  {
    name: String,
    status: String,
    owner: String,
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

const users = [...seedUsers];
const projects = [...seedProjects];
const reports = [...seedReports];

async function seedMongoIfEmpty() {
  const [userCount, projectCount, reportCount] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Report.countDocuments(),
  ]);

  if (userCount === 0) {
    await User.insertMany(seedUsers.map(({ id, ...item }) => item));
  }
  if (projectCount === 0) {
    await Project.insertMany(seedProjects.map(({ id, ...item }) => item));
  }
  if (reportCount === 0) {
    await Report.insertMany(seedReports.map(({ id, ...item }) => item));
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: useDatabase ? "mongodb" : "in-memory" });
});

app.get("/api/users", async (_req, res) => {
  if (useDatabase) {
    const rows = await User.find().lean();
    res.json({
      users: rows.map((item) => ({
        ...item,
        id: String(item._id),
      })),
    });
    return;
  }
  res.json({ users });
});

app.get("/api/projects", async (_req, res) => {
  if (useDatabase) {
    const rows = await Project.find().lean();
    res.json({
      projects: rows.map((item) => ({
        ...item,
        id: String(item._id),
      })),
    });
    return;
  }
  res.json({ projects });
});

app.get("/api/reports", async (_req, res) => {
  if (useDatabase) {
    const rows = await Report.find().lean();
    res.json({
      reports: rows.map((item) => ({
        ...item,
        id: String(item._id),
      })),
    });
    return;
  }
  res.json({ reports });
});

app.post("/api/projects", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const owner = String(req.body?.owner ?? "").trim();
  const status = String(req.body?.status ?? "").trim();
  const progress = Number(req.body?.progress);

  if (!name || !owner || !status || Number.isNaN(progress)) {
    res.status(400).json({ error: "Invalid payload for project creation." });
    return;
  }

  const safeProgress = Math.max(0, Math.min(100, progress));
  if (useDatabase) {
    const created = await Project.create({
      name,
      owner,
      status,
      progress: safeProgress,
    });
    res.status(201).json({
      project: {
        id: String(created._id),
        name: created.name,
        owner: created.owner,
        status: created.status,
        progress: created.progress,
      },
    });
    return;
  }

  const project = {
    id: `p${projects.length + 1}`,
    name,
    owner,
    status,
    progress: safeProgress,
  };
  projects.push(project);
  res.status(201).json({ project });
});

app.post("/api/reports", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const owner = String(req.body?.owner ?? "").trim();
  const status = String(req.body?.status ?? "").trim();

  if (!name || !owner || !status) {
    res.status(400).json({ error: "Invalid payload for report creation." });
    return;
  }

  if (useDatabase) {
    const created = await Report.create({ name, owner, status });
    res.status(201).json({
      report: {
        id: String(created._id),
        name: created.name,
        owner: created.owner,
        status: created.status,
      },
    });
    return;
  }

  const report = { id: `r${reports.length + 1}`, name, owner, status };
  reports.push(report);
  res.status(201).json({ report });
});

async function startServer() {
  if (useDatabase) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      await seedMongoIfEmpty();
      console.log("Connected to MongoDB");
    } catch (error) {
      useDatabase = false;
      console.error("MongoDB connection failed. Falling back to in-memory data.");
      console.error(error.message);
    }
  } else {
    console.log("Running with in-memory backend data (no MONGO_URI)");
  }

  if (!useDatabase) {
    console.log("Backend is running with in-memory data.");
  }

  const server = app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    if (error && error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the existing backend process or change PORT in backend/.env.`
      );
      process.exit(1);
    }

    console.error("Backend server error:", error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("Backend startup failed:", error);
  process.exit(1);
});
