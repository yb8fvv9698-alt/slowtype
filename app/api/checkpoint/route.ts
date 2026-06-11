import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// Removes the text typed after a checkpoint, restoring the doc to that earlier state.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if ((session as any)?.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Your session expired. Please sign out and sign in again." }, { status: 401 });
  }

  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { docId, fromIndex, toIndex } = await req.json();
  if (!docId || fromIndex === undefined || toIndex === undefined || toIndex <= fromIndex) {
    return NextResponse.json({ error: "Nothing to remove." }, { status: 400 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const docs = google.docs({ version: "v1", auth });

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{ deleteContentRange: { range: { startIndex: fromIndex, endIndex: toIndex } } }],
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.response?.data?.error?.message || e.message || "Couldn't go back. Try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
