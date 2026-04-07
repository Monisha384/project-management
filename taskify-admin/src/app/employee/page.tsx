import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./employee.module.css";

type UserRecord = {
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

type ProjectRecord = {
  id: string;
  name: string;
  owner: string;
  status: "Planned" | "In Progress" | "Completed";
  progress: number;
};

type PageProps = {
  searchParams: Promise<{ user?: string }>;
};

export default async function EmployeePage({ searchParams }: PageProps) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
  const [usersResponse, projectsResponse] = await Promise.all([
    fetch(`${backendUrl}/api/users`, { cache: "no-store" }),
    fetch(`${backendUrl}/api/projects`, { cache: "no-store" }),
  ]);
  const usersPayload = (await usersResponse.json()) as { users: UserRecord[] };
  const projectsPayload = (await projectsResponse.json()) as { projects: ProjectRecord[] };
  const users = usersPayload.users ?? [];
  const projects = projectsPayload.projects ?? [];
  const projectByOwner = new Map(projects.map((project) => [project.owner, project]));
  const { user } = await searchParams;
  const selectedName = user ?? "";
  const selectedUser = users.find(
    (entry) => entry.name.toLowerCase() === selectedName.toLowerCase()
  );

  if (!selectedUser) {
    redirect("/employee/login");
  }

  const otherUsers = users.filter((entry) => entry.name !== selectedUser.name);
  const selectedProject = projectByOwner.get(selectedUser.name);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>User Panel</p>
          <h1>Welcome, {selectedUser.name}</h1>
        </div>
        <Link href="/admin">Back to Admin</Link>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>My Tasks</h2>
          <ul>
            {selectedUser.tasks.map((task) => (
              <li key={task.title}>
                <strong>{task.title}</strong>
                <span>
                  {task.priority} Priority - Due {task.dueDate}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Project Progress</h2>
          <p>{selectedProject?.name ?? "No Project Assigned"}</p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${selectedProject?.progress ?? 0}%` }}
            />
          </div>
          <small>{selectedProject?.progress ?? 0}% complete</small>
        </article>

        <article className={styles.card}>
          <h2>Attendance</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Present</td>
                <td>{selectedUser.attendance.presentDays}</td>
              </tr>
              <tr>
                <td>Absent</td>
                <td>{selectedUser.attendance.absentDays}</td>
              </tr>
              <tr>
                <td>Late</td>
                <td>{selectedUser.attendance.lateDays}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section className={styles.userListSection}>
        <h2>Other Users</h2>
        <ul className={styles.userList}>
          {otherUsers.map((entry) => (
            <li key={entry.name}>
              <div>
                <strong>{entry.name}</strong>
                <span>
                  {projectByOwner.get(entry.name)?.name ?? "No Project"} -{" "}
                  {projectByOwner.get(entry.name)?.progress ?? 0}% progress
                </span>
              </div>
              <Link href={`/employee?user=${encodeURIComponent(entry.name)}`}>
                View User
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
