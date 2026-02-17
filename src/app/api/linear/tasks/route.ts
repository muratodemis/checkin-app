import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const LINEAR_API = "https://api.linear.app/graphql";

/* ─── Step 1: Fetch all Linear users ─── */
const USERS_QUERY = `{
  users {
    nodes {
      id
      displayName
      name
      email
      active
    }
  }
}`;

/* ─── Step 2: Fetch issues by assignee ID ─── */
const ISSUES_BY_USER_QUERY = `
query UserIssues($userId: ID!) {
  issues(
    filter: {
      assignee: { id: { eq: $userId } }
      state: { type: { nin: ["completed", "canceled"] } }
    }
    first: 25
    orderBy: updatedAt
  ) {
    nodes {
      id
      identifier
      title
      priority
      dueDate
      url
      createdAt
      updatedAt
      state {
        name
        type
        color
      }
      labels {
        nodes {
          name
          color
        }
      }
      project {
        name
        color
      }
    }
  }
}`;

const PRIORITY_MAP: Record<number, string> = {
  0: "none",
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

const STATE_TYPE_MAP: Record<string, string> = {
  triage: "triage",
  backlog: "backlog",
  unstarted: "todo",
  started: "in_progress",
  completed: "done",
  canceled: "canceled",
};

/* ─── Normalize Turkish chars for matching ─── */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ─── Smart match: our member name → Linear user ─── */
interface LinearUser {
  id: string;
  displayName: string;
  name: string;
  email?: string;
  active: boolean;
}

function findLinearUser(memberName: string, linearUsers: LinearUser[]): LinearUser | null {
  const normalizedMember = normalize(memberName);
  const memberParts = normalizedMember.split(" ");

  let bestMatch: LinearUser | null = null;
  let bestScore = 0;

  for (const user of linearUsers) {
    if (!user.active) continue;

    let score = 0;

    // Extract all searchable strings from the Linear user
    const candidates = [
      normalize(user.displayName || ""),
      normalize(user.name || ""),
      normalize((user.email || "").split("@")[0].replace(/[._]/g, " ")),
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;

      // Exact full match
      if (candidate === normalizedMember) {
        return user; // perfect match
      }

      const candidateParts = candidate.split(" ");

      // Check how many member name parts appear in this candidate
      let partMatches = 0;
      for (const part of memberParts) {
        if (part.length < 2) continue;
        if (candidate.includes(part)) partMatches++;
        // Also check individual candidate parts
        for (const cp of candidateParts) {
          if (cp.length < 2 && part.length < 2) continue;
          if (cp === part) partMatches += 2;
          if (cp.startsWith(part) || part.startsWith(cp)) partMatches++;
        }
      }

      score = Math.max(score, partMatches);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = user;
    }
  }

  // Only return if we had a reasonable match (at least 2 matching parts/substrings)
  return bestScore >= 2 ? bestMatch : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const memberId = searchParams.get("memberId");

  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "LINEAR_API_KEY not configured" }, { status: 500 });
  }

  if (!memberId) {
    return NextResponse.json({ error: "memberId required" }, { status: 400 });
  }

  // Resolve member name from our DB
  const supabase = createServerClient();
  const { data: member } = await supabase
    .from("members")
    .select("name")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  try {
    // Step 1: Fetch all Linear users
    const usersRes = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: USERS_QUERY }),
    });

    if (!usersRes.ok) {
      return NextResponse.json({ error: `Linear API error: ${usersRes.status}` }, { status: 502 });
    }

    const usersJson = await usersRes.json();
    const linearUsers: LinearUser[] = usersJson.data?.users?.nodes || [];

    // Step 2: Match our member to a Linear user
    const matchedUser = findLinearUser(member.name, linearUsers);

    if (!matchedUser) {
      return NextResponse.json({
        tasks: [],
        memberName: member.name,
        totalCount: 0,
        debug: `No Linear user matched for "${member.name}"`,
      });
    }

    // Step 3: Fetch issues by the matched Linear user ID
    const issuesRes = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: ISSUES_BY_USER_QUERY,
        variables: { userId: matchedUser.id },
      }),
    });

    if (!issuesRes.ok) {
      return NextResponse.json({ error: `Linear API error: ${issuesRes.status}` }, { status: 502 });
    }

    const issuesJson = await issuesRes.json();
    const issues = issuesJson.data?.issues?.nodes || [];

    // Transform to our format
    const tasks = issues.map((issue: {
      id: string;
      identifier: string;
      title: string;
      priority: number;
      dueDate: string | null;
      url: string;
      createdAt: string;
      updatedAt: string;
      state: { name: string; type: string; color: string };
      labels: { nodes: { name: string; color: string }[] };
      project: { name: string; color: string } | null;
    }) => ({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      status: STATE_TYPE_MAP[issue.state?.type] || "todo",
      statusName: issue.state?.name || "Unknown",
      statusColor: issue.state?.color || "#9CA3AF",
      priority: PRIORITY_MAP[issue.priority] || "none",
      dueDate: issue.dueDate || null,
      url: issue.url,
      label: issue.labels?.nodes?.[0]?.name || issue.project?.name || "",
      labelColor: issue.labels?.nodes?.[0]?.color || issue.project?.color || "#9CA3AF",
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    }));

    return NextResponse.json({
      tasks,
      memberName: member.name,
      linearUser: matchedUser.displayName,
      totalCount: tasks.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
