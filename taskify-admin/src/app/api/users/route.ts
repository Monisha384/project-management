import { NextResponse } from "next/server";
import { getUsers } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({ users: getUsers() });
}
