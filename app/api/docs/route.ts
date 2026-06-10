import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if ((session as any)?.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Your session expired. Please sign out and sign in again." }, { status: 401 });
  }

  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "Not signed in. Please sign out and sign in again." }, { status: 401 });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      fields: "files(id, name, modifiedTime)",
      orderBy: "modifiedTime desc",
      pageSize: 20,
    });
    return NextResponse.json({ files: res.data.files || [] });
  } catch (e: any) {
    const msg = e?.response?.data?.error?.message || e.message || "Unknown error loading docs.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
