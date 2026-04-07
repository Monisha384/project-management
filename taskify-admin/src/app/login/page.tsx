"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/admin");
  };

  return (
    <main className={styles.loginPage}>
      <div className={styles.brandingPanel}>
        <p className={styles.kicker}>Project Management Admin Panel</p>
        <h1>Manage projects, tasks, reports, and teams in one place.</h1>
        <p>
          Admin access gives you control over employee workload, project
          tracking, and report insights.
        </p>
      </div>

      <section className={styles.formCard}>
        <h2>Admin Login</h2>
        <p>Sign in to continue to the dashboard.</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <label>
            Email
            <input type="email" placeholder="admin@company.com" required />
          </label>

          <label>
            Password
            <input type="password" placeholder="Enter your password" required />
          </label>

          <button type="submit">Login as Admin</button>
        </form>
      </section>
    </main>
  );
}
