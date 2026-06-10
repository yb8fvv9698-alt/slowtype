import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// POST: insert a single character at a given index
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { docId, char, index } = await req.json();
  if (!docId || char === undefined || index === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const docs = google.docs({ version: "v1", auth });

    if (char === "\n") {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: { requests: [{ insertText: { location: { index: index + 1 }, text: "\n" } }] },
      });
    } else {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: { requests: [{ insertText: { location: { index: index + 1 }, text: char } }] },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: get the current end index of a doc so we know where to start inserting
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const docId = req.nextUrl.searchParams.get("docId");
  const position = req.nextUrl.searchParams.get("position") || "end";
  if (!docId) return NextResponse.json({ error: "Missing docId" }, { status: 400 });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const docs = google.docs({ version: "v1", auth });
    const doc = await docs.documents.get({ documentId: docId });
    const content = doc.data.body?.content || [];
    const lastEl = content[content.length - 1];
    const endIndex = lastEl?.endIndex ?? 1;

    let startIndex = 1;
    if (position === "end") startIndex = Math.max(1, endIndex - 1);
    else if (position === "newpage") {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: { requests: [{ insertPageBreak: { location: { index: Math.max(1, endIndex - 1) } } }] },
      });
      startIndex = endIndex;
    }

    return NextResponse.json({ startIndex });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
