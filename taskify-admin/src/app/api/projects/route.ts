import { NextRequest, NextResponse } from "next/server";
import { addProject, getProjects } from "@/lib/data-store";
import type { ProjectStatus } from "@/lib/data-store";

type CreateProjectPayload = {
  name?: string;
  owner?: string;
  status?: ProjectStatus;
  progress?: number;
};

export async function GET() {
  return NextResponse.json({ projects: getProjects() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateProjectPayload;
  const name = (body.name ?? "").trim();
  const owner = (body.owner ?? "").trim();
  const status = body.status;
  const progress = Number(body.progress);

  if (!name || !owner || !status || Number.isNaN(progress)) {
    return NextResponse.json(
      { error: "Invalid payload for project creation." },
      { status: 400 }
    );
  }

  const safeProgress = Math.max(0, Math.min(100, progress));
  const project = addProject({ name, owner, status, progress: safeProgress });
  return NextResponse.json({ project }, { status: 201 });
}
