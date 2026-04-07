"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./user-login.module.css";

type UserItem = {
  id: string;
  name: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export default function UserLoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users`);
        const payload = (await response.json()) as { users: UserItem[] };
        setUsers(payload.users ?? []);
      } catch {
        setUsers([]);
      }
    };

    void loadUsers();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userName = String(formData.get("userName") || "");

    if (!users.some((user) => user.name === userName)) {
      return;
    }

    router.push(`/employee?user=${encodeURIComponent(userName)}`);
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>User Login</h1>
        <p>Select your user name to view your details.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            User Name
            <select name="userName" defaultValue="" required>
              <option value="" disabled>
                Choose user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}
