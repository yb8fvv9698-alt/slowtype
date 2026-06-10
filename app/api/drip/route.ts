import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const dripJobs = new Map<string, {
  active: boolean; paused: boolean; done: boolean;
  index: number; total: number; text: string;
  docId: string; accessToken: string; baseMs: number; feel: string;
}>();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { docId, text, durationMins, position, feel } = await req.json();
  if (!docId || !text || !durationMins) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const baseMs = Math.max(Math.floor((durationMins * 60 * 1000) / text.length), 200);
  const jobId = `job_${Date.now()}`;
  dripJobs.set(jobId, { active: true, paused: false, done: false, index: 0, total: text.length, text, docId, accessToken, baseMs, feel: feel || "natural" });
  runDrip(jobId, position || "end");
  return NextResponse.json({ jobId });
}

export async function PATCH(req: NextRequest) {
  const { jobId, action } = await req.json();
  const job = dripJobs.get(jobId);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (action === "pause") job.paused = true;
  if (action === "resume") job.paused = false;
  if (action === "stop") { job.active = false; dripJobs.delete(jobId); }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  const job = dripJobs.get(jobId);
  if (!job) return NextResponse.json({ active: false, done: true });
  return NextResponse.json({ active: job.active, paused: job.paused, done: job.done, index: job.index, total: job.total, baseMs: job.baseMs });
}

async function runDrip(jobId: string, position: string) {
  const job = dripJobs.get(jobId);
  if (!job) return;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: job.accessToken });
  const docs = google.docs({ version: "v1", auth });
  let insertIndex = 1;
  try {
    const doc = await docs.documents.get({ documentId: job.docId });
    const content = doc.data.body?.content || [];
    const lastEl = content[content.length - 1];
    const endIndex = lastEl?.endIndex ?? 1;
    if (position === "end") insertIndex = Math.max(1, endIndex - 1);
    else if (position === "newpage") {
      await docs.documents.batchUpdate({ documentId: job.docId, requestBody: { requests: [{ insertPageBreak: { location: { index: Math.max(1, endIndex - 1) } } }] } });
      insertIndex = Math.max(1, endIndex);
    }
  } catch (e) { console.error("position error", e); }

  while (job.active && job.index < job.total) {
    if (job.paused) { await sleep(500); continue; }
    const char = job.text[job.index];
    try {
      await docs.documents.batchUpdate({ documentId: job.docId, requestBody: { requests: [{ insertText: { location: { index: insertIndex + job.index }, text: char } }] } });
      job.index++;
    } catch (e) { await sleep(2000); }
    await sleep(getDelay(job.baseMs, char, job.feel));
  }
  job.done = true; job.active = false;
}

function getDelay(base: number, char: string, feel: string): number {
  if (feel === "steady") return base * (0.9 + Math.random() * 0.2);
  if (feel === "slow") {
    if (".!?".includes(char)) return base * (3 + Math.random() * 3);
    if (",;:".includes(char)) return base * (1.8 + Math.random() * 1.5);
    return base * (1 + Math.random() * 0.6);
  }
  if (".!?,;:".includes(char)) return base * (1.8 + Math.random() * 1.2);
  if (Math.random() < 0.1) return base * (0.5 + Math.random() * 0.3);
  return base * (0.75 + Math.random() * 0.8);
}
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
