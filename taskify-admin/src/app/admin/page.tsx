"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

type ReportItem = {
  id: string;
  name: string;
  status: "Completed" | "Pending" | "In Review";
  owner: string;
};

type ProjectItem = {
  id: string;
  name: string;
  owner: string;
  status: "Planned" | "In Progress" | "Completed";
  progress: number;
};

type UserItem = {
  id: string;
  name: string;
  role: string;
  workload: number;
  attendance: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
  };
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export default function AdminPage() {
  const [reportRows, setReportRows] = useState<ReportItem[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "horizontal">("sidebar");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  const effectiveTheme = useMemo(() => {
    if (themeMode !== "system") {
      return themeMode;
    }
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
  }, [effectiveTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [usersResponse, projectsResponse, reportsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/users`),
          fetch(`${BACKEND_URL}/api/projects`),
          fetch(`${BACKEND_URL}/api/reports`),
        ]);
        const usersPayload = (await usersResponse.json()) as { users: UserItem[] };
        const projectsPayload = (await projectsResponse.json()) as {
          projects: ProjectItem[];
        };
        const reportsPayload = (await reportsResponse.json()) as {
          reports: ReportItem[];
        };
        setUsers(usersPayload.users ?? []);
        setProjects(projectsPayload.projects ?? []);
        setReportRows(reportsPayload.reports ?? []);
      } catch {
        setStatusMessage("Failed to load backend data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const teamMembers = users.map((user) => user.name);
  const attendanceData = users.map((user) => ({
    name: user.name,
    presentDays: user.attendance.presentDays,
    absentDays: user.attendance.absentDays,
    lateDays: user.attendance.lateDays,
  }));

  const handleTaskSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("taskTitle") || "").trim();
    const assignee = String(formData.get("taskAssignee") || "").trim();

    if (!title || !assignee) {
      setStatusMessage("Please fill task title and assign a user.");
      return;
    }

    setTasks((prev) => [...prev, `${title} (${assignee})`]);
    setStatusMessage(`Task "${title}" created and assigned to ${assignee}.`);
    event.currentTarget.reset();
  };

  const handleProjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("projectName") || "").trim();
    const owner = String(formData.get("projectOwner") || "").trim();
    const status = String(formData.get("projectStatus") || "").trim();
    const progress = Number(formData.get("projectProgress"));

    if (!name || !owner || !status || Number.isNaN(progress)) {
      setStatusMessage("Please fill project details: name, owner, status, progress.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          owner,
          status,
          progress,
        }),
      });

      if (!response.ok) {
        setStatusMessage("Failed to create project in backend.");
        return;
      }

      const payload = (await response.json()) as { project: ProjectItem };
      setProjects((prev) => [...prev, payload.project]);
      setStatusMessage(`Project "${name}" created with owner ${owner}.`);
      form.reset();
    } catch {
      setStatusMessage("Failed to create project in backend.");
    }
  };

  const handleExport = () => {
    const csvRows = [
      "Report,Status,Owner",
      ...reportRows.map(
        (row) => `"${row.name}","${row.status}","${row.owner}"`
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-reports.csv";
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Reports exported as CSV.");
  };

  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) / projects.length
        )
      : 0;
  const pendingReports = reportRows.filter(
    (item) => item.status === "Pending" || item.status === "In Review"
  ).length;

  return (
    <main
      className={`${styles.dashboard} ${
        layoutMode === "horizontal" ? styles.horizontalLayout : ""
      } ${effectiveTheme === "dark" ? styles.darkMode : ""}`}
    >
      <aside className={styles.sidebar}>
        <h1>Project Management</h1>
        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#reports">Reports</a>
          <a href="#project-status">Project Status</a>
          <a href="#attendance">Attendance</a>
          <a href="#analysis">Team Analysis</a>
          <a href="#tasks">Tasks</a>
          <a href="#projects">Projects</a>
          <Link href="/employee/login">User Page</Link>
        </nav>
      </aside>

      <section className={styles.contentArea} id="dashboard">
        <header className={styles.topBar}>
          <div>
            <p>Welcome back, Admin</p>
            <h2>Project Management Dashboard</h2>
          </div>
          <div className={styles.topActions}>
            <button type="button" onClick={() => setIsAppearanceOpen(true)}>
              Appearance
            </button>
            <a href="/login">Logout</a>
          </div>
        </header>

        <section className={styles.metricGrid}>
          <article>
            <h3>Total Projects</h3>
            <p>{projects.length}</p>
          </article>
          <article>
            <h3>Open Tasks</h3>
            <p>{132 + tasks.length}</p>
          </article>
          <article>
            <h3>Pending Reports</h3>
            <p>{pendingReports}</p>
          </article>
          <article>
            <h3>Users Active</h3>
            <p>{users.length}</p>
          </article>
          <article>
            <h3>Avg. Project Progress</h3>
            <p>{avgProgress}%</p>
          </article>
        </section>

        {isLoading ? <p className={styles.statusMessage}>Loading backend data...</p> : null}
        {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}

        <section className={styles.mainGrid}>
          <article className={styles.panel} id="reports">
            <div className={styles.panelHeading}>
              <h3>Admin Reports</h3>
              <button type="button" onClick={handleExport}>
                Export
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Status</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((report) => (
                  <tr key={report.id}>
                    <td>{report.name}</td>
                    <td>
                      <span
                        className={`${styles.reportBadge} ${
                          styles[report.status.replace(" ", "").toLowerCase()]
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>{report.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className={styles.panel} id="project-status">
            <h3>Project Status & Progress</h3>
            <div className={styles.projectGrid}>
              {projects.map((project) => (
                <div key={project.id} className={styles.projectItem}>
                  <div className={styles.projectHeader}>
                    <strong>{project.name}</strong>
                    <span className={`${styles.badge} ${styles[project.status.replace(" ", "").toLowerCase()]}`}>
                      {project.status}
                    </span>
                  </div>
                  <small>Owner: {project.owner}</small>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className={styles.progressText}>{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel} id="attendance">
            <h3>User Attendance</h3>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.presentDays}</td>
                    <td>{row.absentDays}</td>
                    <td>{row.lateDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className={styles.panel} id="analysis">
            <h3>Team Project Analysis</h3>
            <div className={styles.analysisGrid}>
              <div>
                <p>Completed Projects</p>
                <strong>{projects.filter((project) => project.status === "Completed").length}</strong>
              </div>
              <div>
                <p>Projects In Progress</p>
                <strong>{projects.filter((project) => project.status === "In Progress").length}</strong>
              </div>
              <div>
                <p>High Load Users</p>
                <strong>
                  {
                    attendanceData.filter(
                      (employee) => employee.presentDays >= 21 && employee.lateDays <= 2
                    ).length
                  }
                </strong>
              </div>
            </div>
          </article>

          <article className={styles.panel} id="tasks">
            <h3>Add Task</h3>
            <form className={styles.form} onSubmit={handleTaskSubmit}>
              <input name="taskTitle" placeholder="Task title" required />
              <textarea
                name="taskDescription"
                rows={3}
                placeholder="Task description"
                required
              />
              <select name="taskAssignee" defaultValue="" required>
                <option value="" disabled>
                  Assign user
                </option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <button type="submit">Create Task</button>
            </form>
            {tasks.length > 0 ? (
              <ul className={styles.createdList}>
                {tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            ) : null}
          </article>

          <article className={styles.panel} id="projects">
            <h3>Add Project</h3>
            <form className={styles.form} onSubmit={handleProjectSubmit}>
              <input name="projectName" placeholder="Project name" required />
              <input name="projectDate" type="date" required />
              <select name="projectOwner" defaultValue="" required>
                <option value="" disabled>
                  Project owner
                </option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <select name="projectStatus" defaultValue="In Progress" required>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                name="projectProgress"
                type="number"
                min={0}
                max={100}
                placeholder="Progress %"
                required
              />
              <button type="submit">Create Project</button>
            </form>
            {projects.length > 0 ? (
              <ul className={styles.createdList}>
                {projects.slice(-5).map((project) => (
                  <li key={project.id}>
                    {project.name} ({project.owner}) - {project.status}, {project.progress}%
                  </li>
                ))}
              </ul>
            ) : null}
          </article>

          <article className={styles.panel} id="employees">
            <h3>User Work Allocation</h3>
            <ul className={styles.employeeList}>
              {users.map((user) => (
                <li key={user.id}>
                  <span>{user.name}</span>
                  <small>
                    {user.role} - {user.workload}% load
                  </small>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>

      {isAppearanceOpen ? (
        <div className={styles.modalOverlay}>
          <section className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Appearance</h3>
              <button type="button" onClick={() => setIsAppearanceOpen(false)}>
                x
              </button>
            </div>

            <div className={styles.modalBlock}>
              <p>Theme</p>
              <div className={styles.choiceRow}>
                <button
                  type="button"
                  className={themeMode === "light" ? styles.choiceActive : ""}
                  onClick={() => setThemeMode("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={themeMode === "dark" ? styles.choiceActive : ""}
                  onClick={() => setThemeMode("dark")}
                >
                  Dark
                </button>
                <button
                  type="button"
                  className={themeMode === "system" ? styles.choiceActive : ""}
                  onClick={() => setThemeMode("system")}
                >
                  System
                </button>
              </div>
            </div>

            <div className={styles.modalBlock}>
              <p>Primary Color</p>
              <div className={styles.colorRow}>
                {["#14b8a6", "#ec4899", "#3b82f6", "#22c55e", "#ef4444"].map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.colorDot} ${
                        primaryColor === color ? styles.colorActive : ""
                      }`}
                      style={{ background: color }}
                      onClick={() => setPrimaryColor(color)}
                      aria-label={`Set color ${color}`}
                    />
                  )
                )}
              </div>
            </div>

            <div className={styles.modalBlock}>
              <p>Layout</p>
              <div className={styles.choiceRow}>
                <button
                  type="button"
                  className={layoutMode === "sidebar" ? styles.choiceActive : ""}
                  onClick={() => setLayoutMode("sidebar")}
                >
                  Sidebar
                </button>
                <button
                  type="button"
                  className={layoutMode === "horizontal" ? styles.choiceActive : ""}
                  onClick={() => setLayoutMode("horizontal")}
                >
                  Horizontal
                </button>
              </div>
            </div>

            <div className={styles.modalBlock}>
              <p>Direction</p>
              <div className={styles.choiceRow}>
                <button
                  type="button"
                  className={direction === "ltr" ? styles.choiceActive : ""}
                  onClick={() => setDirection("ltr")}
                >
                  LTR
                </button>
                <button
                  type="button"
                  className={direction === "rtl" ? styles.choiceActive : ""}
                  onClick={() => setDirection("rtl")}
                >
                  RTL
                </button>
              </div>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsAppearanceOpen(false)}
            >
              Close
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
