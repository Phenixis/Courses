import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Add a verification that it's the server who send the request.
  
  const { githubUsername } = await req.json();

  const res = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPOSITORY_NAME}/collaborators/${githubUsername}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ permission: "pull" }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
