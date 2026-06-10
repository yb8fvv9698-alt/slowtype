import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
