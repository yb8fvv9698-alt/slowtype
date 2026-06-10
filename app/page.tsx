"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";

const C = {
  dark: "#1a1208", cream: "#faf7f2", amber: "#e8a24a",
  border: "#ddd0bc", muted: "#9a8060", brown: "#6a5030",
  white: "#ffffff", softBg: "#f0e8d8",
};

const s: Record<string, any> = {
  nav: { background: C.dark, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBrand: { display: "flex", alignItems: "center", gap: 10, color: C.cream, fontSize: 22, fontWeight: 800 },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  navEmail: { color: C.muted, fontSize: 13 },
  navBtn: { background: "transparent", border: "1px solid #3a2a18", color: C.muted, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  page: { maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" },
  card: { background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  cardHead: { background: C.dark, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 },
  cardIcon: { width: 42, height: 42, background: C.amber, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  cardTitle: { color: C.cream, fontSize: 18, fontWeight: 700 },
  cardSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  cardBody: { padding: "22px 22px 24px" },
  label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.brown, marginBottom: 8, display: "block" },
  textarea: { width: "100%", minHeight: 130, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 16, fontFamily: "Georgia, serif", background: C.cream, color: C.dark, resize: "none", outline: "none", lineHeight: 1.7 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 },
  durBtn: (sel: boolean) => ({ padding: "12px 6px", border: `1.5px solid ${sel ? C.dark : C.border}`, borderRadius: 10, background: sel ? C.dark : C.cream, cursor: "pointer", textAlign: "center" }),
  durNum: (sel: boolean) => ({ fontSize: 22, fontWeight: 800, display: "block", color: sel ? C.amber : C.dark, lineHeight: 1 }),
  durUnit: (sel: boolean) => ({ fontSize: 11, display: "block", color: sel ? "#c8a870" : C.muted, marginTop: 2 }),
  posBtn: (sel: boolean) => ({ padding: "11px 8px", border: `1.5px solid ${sel ? C.dark : C.border}`, borderRadius: 10, background: sel ? C.dark : C.cream, color: sel ? C.cream : C.dark, cursor: "pointer", fontSize: 13, fontWeight: 600 }),
  select: { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", fontSize: 15, background: C.cream, color: C.dark, outline: "none", marginBottom: 20, cursor: "pointer" },
  startBtn: (ok: boolean) => ({ width: "100%", padding: "16px", background: ok ? C.amber : "#e0cdb0", color: ok ? C.dark : "#a08060", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 800, cursor: ok ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }),
  docItem: (sel: boolean) => ({ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: `1.5px solid ${sel ? C.amber : C.border}`, borderRadius: 12, background: sel ? "#fdf3e3" : C.cream, cursor: "pointer", marginBottom: 8 }),
  check: { width: 20, height: 20, borderRadius: "50%", background: C.amber, color: C.dark, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto", flexShrink: 0 },
  progTrack: { width: "100%", height: 10, background: "#ead9c0", borderRadius: 99, overflow: "hidden", marginBottom: 8 },
  progFill: (pct: number) => ({ height: "100%", width: `${pct}%`, background: C.amber, borderRadius: 99, transition: "width 0.5s linear" }),
  actionRow: { display: "flex", gap: 10, marginBottom: 16 },
  pauseBtn: { flex: 1, padding: "12px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", color: C.dark },
  stopBtn: { flex: 1, padding: "12px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", color: "#9a3020" },
  tip: { background: C.softBg, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.brown, lineHeight: 1.6 },
  wc: { fontSize: 12, color: C.muted, textAlign: "right", marginTop: 4, marginBottom: 16 },
  badge: { display: "flex", alignItems: "center", gap: 8, background: C.softBg, borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "#5a3e1c", marginBottom: 16 },
  pulse: { width: 10, height: 10, borderRadius: "50%", background: C.amber, animation: "pulse 1.4s ease-in-out infinite", flexShrink: 0 },
  pctRow: { display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 18 },
  runRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  heroWrap: { textAlign: "center", padding: "64px 24px 48px", maxWidth: 620, margin: "0 auto" },
  h1: { fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, color: C.dark, marginBottom: 18 },
  heroPara: { fontSize: 18, color: C.brown, lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" },
  heroBtn: { display: "inline-flex", alignItems: "center", gap: 12, background: C.amber, color: C.dark, border: "none", borderRadius: 14, padding: "18px 42px", fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(232,162,74,0.35)" },
  heroNote: { fontSize: 14, color: C.muted, marginTop: 16 },
  stepsRow: { display: "flex", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.white },
  stepItem: (last: boolean) => ({ flex: 1, padding: "18px 10px", textAlign: "center", borderRight: last ? "none" : `1px solid ${C.border}` }),
  stepNum: { width: 28, height: 28, borderRadius: "50%", background: C.amber, color: C.dark, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" },
  stepTitle: { fontSize: 13, fontWeight: 700, color: C.dark },
  stepDesc: { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 },
  signinCard: { maxWidth: 400, margin: "80px auto 0", border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  googleBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px", border: `1.5px solid ${C.border}`, borderRadius: 12, background: C.white, fontSize: 16, fontWeight: 600, cursor: "pointer", color: C.dark },
  googleDot: { width: 24, height: 24, borderRadius: "50%", background: C.amber, color: C.dark, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  signinNote: { fontSize: 13, color: C.muted, textAlign: "center", marginTop: 14, lineHeight: 1.6 },
  errorBox: { background: "#fde8e8", border: "1px solid #f4a8a8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#7a1a1a", marginTop: 12 },
};

type Screen = "hero" | "docs" | "setup" | "running";
type Doc = { id: string; name: string; modifiedTime: string };

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

export default function Home() {
  const { data: session, status } = useSession();
  const [screen, setScreen] = useState<Screen>("hero");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [text, setText] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState("end");
  const [feel, setFeel] = useState("natural");
  const [charIndex, setCharIndex] = useState(0);
  const [docIndex, setDocIndex] = useState(0); // position in the actual doc
  const [totalChars, setTotalChars] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const charIndexRef = useRef(0);
  const docIndexRef = useRef(0);
  const textRef = useRef("");
  const durationRef = useRef(0);
  const feelRef = useRef("natural");
  const docIdRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (session && screen === "docs" && docs.length === 0) {
      setDocsLoading(true);
      fetch("/api/docs").then(r => r.json()).then(d => {
        setDocs(d.files || []);
        setDocsLoading(false);
      }).catch(() => setDocsLoading(false));
    }
  }, [session, screen]);

  const typeNextChar = useCallback(async () => {
    if (!runningRef.current) return;
    if (pausedRef.current) {
      timerRef.current = setTimeout(typeNextChar, 500);
      return;
    }

    const idx = charIndexRef.current;
    const txt = textRef.current;

    if (idx >= txt.length) {
      setDone(true);
      setRunning(false);
      runningRef.current = false;
      return;
    }

    const char = txt[idx];
    const base = Math.max(Math.floor((durationRef.current * 60 * 1000) / txt.length), 300);
    const delay = getDelay(base, char, feelRef.current);

    try {
      const res = await fetch("/api/drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId: docIdRef.current, char, index: docIndexRef.current }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setRunning(false); runningRef.current = false; return; }

      charIndexRef.current = idx + 1;
      docIndexRef.current = docIndexRef.current + 1;
      setCharIndex(idx + 1);
    } catch (e) {
      // retry on network error
    }

    timerRef.current = setTimeout(typeNextChar, delay);
  }, []);

  async function startDrip() {
    if (!selectedDoc || !text.trim() || !duration) return;
    setError("");

    // Get start index in doc
    const r = await fetch(`/api/drip?docId=${selectedDoc.id}&position=${position}`).then(r => r.json());
    if (r.error) { setError(r.error); return; }

    const trimmed = text.trim();
    textRef.current = trimmed;
    durationRef.current = duration;
    feelRef.current = feel;
    docIdRef.current = selectedDoc.id;
    charIndexRef.current = 0;
    docIndexRef.current = r.startIndex;
    runningRef.current = true;
    pausedRef.current = false;

    setTotalChars(trimmed.length);
    setCharIndex(0);
    setDone(false);
    setRunning(true);
    setPaused(false);
    setScreen("running");

    timerRef.current = setTimeout(typeNextChar, 500);
  }

  function togglePause() {
    const np = !pausedRef.current;
    pausedRef.current = np;
    setPaused(np);
  }

  function stopDrip() {
    runningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
    setScreen("setup");
  }

  const pct = totalChars ? Math.round((charIndex / totalChars) * 100) : 0;
  const minsLeft = duration && totalChars ? Math.ceil(((totalChars - charIndex) / totalChars) * duration) : 0;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const Nav = () => (
    <nav style={s.nav}>
      <div style={s.navBrand}><span>🐢</span> SlowType</div>
      <div style={s.navRight}>
        <span style={s.navEmail}>{(session as any)?.user?.email}</span>
        <button style={s.navBtn} onClick={() => signOut()}>Sign out</button>
      </div>
    </nav>
  );

  // HERO
  if (screen === "hero") return (
    <div>
      <nav style={s.nav}>
        <div style={s.navBrand}><span>🐢</span> SlowType</div>
        <button style={{ ...s.startBtn(true), width: "auto", padding: "10px 22px", fontSize: 14 }} onClick={() => session ? setScreen("docs") : signIn("google")}>
          {session ? "Open app →" : "Sign in →"}
        </button>
      </nav>
      <div style={s.heroWrap}>
        <h1 style={s.h1}>Your words,<br /><span style={{ color: C.amber }}>at your pace.</span></h1>
        <p style={s.heroPara}>Can't type easily? Paste your text, pick how long it should take, and SlowType places every word gently into your Google Doc — one character at a time.</p>
        <button style={s.heroBtn} onClick={() => session ? setScreen("docs") : signIn("google")}>🐢 Get started — it's free</button>
        <p style={s.heroNote}>Works with any Google Doc. No downloads needed.</p>
      </div>
      <div style={s.stepsRow}>
        {[["1","Sign in","Google account"],["2","Pick your doc","Any doc you own"],["3","Paste your text","As much as you like"],["4","Choose a time","30 min to 5 hours"],["5","Walk away","It runs by itself"]].map(([n,t,d], i, arr) => (
          <div key={n} style={s.stepItem(i === arr.length - 1)}>
            <div style={s.stepNum}>{n}</div>
            <div style={s.stepTitle}>{t}</div>
            <div style={s.stepDesc}>{d}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </div>
  );

  if (status === "unauthenticated" || status === "loading") return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <nav style={s.nav}><div style={s.navBrand}><span>🐢</span> SlowType</div></nav>
      <div style={s.signinCard}>
        <div style={s.cardHead}><div style={s.cardIcon}>🔑</div><div><div style={s.cardTitle}>Sign in to continue</div><div style={s.cardSub}>Connect your Google account</div></div></div>
        <div style={s.cardBody}>
          <button style={s.googleBtn} onClick={() => signIn("google")}><div style={s.googleDot}>G</div>Continue with Google</button>
          <p style={s.signinNote}>SlowType only accesses the document you choose.</p>
        </div>
      </div>
    </div>
  );

  // DOC PICKER
  if (screen === "docs") return (
    <div>
      <Nav />
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.cardHead}><div style={s.cardIcon}>📄</div><div><div style={s.cardTitle}>Pick your document</div><div style={s.cardSub}>Which doc should we type into?</div></div></div>
          <div style={s.cardBody}>
            {docsLoading && <p style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>Loading your docs…</p>}
            {!docsLoading && docs.length === 0 && <p style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>No Google Docs found.</p>}
            {docs.map(doc => (
              <div key={doc.id} style={s.docItem(selectedDoc?.id === doc.id)} onClick={() => setSelectedDoc(doc)}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{new Date(doc.modifiedTime).toLocaleDateString()}</div>
                </div>
                {selectedDoc?.id === doc.id && <div style={s.check}>✓</div>}
              </div>
            ))}
            <button style={s.startBtn(!!selectedDoc)} disabled={!selectedDoc} onClick={() => selectedDoc && setScreen("setup")}>Use this doc →</button>
          </div>
        </div>
      </div>
    </div>
  );

  // SETUP
  if (screen === "setup") return (
    <div>
      <Nav />
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.cardHead}><div style={s.cardIcon}>✍️</div><div><div style={s.cardTitle}>Set it up</div><div style={{ ...s.cardSub, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedDoc?.name}</div></div></div>
          <div style={s.cardBody}>
            <label style={s.label}>Your text</label>
            <textarea style={s.textarea} placeholder="Paste or type what you want to appear in your document…" value={text} onChange={e => setText(e.target.value)} />
            <div style={s.wc}>{words} words · {text.length} characters</div>

            <label style={s.label}>Where in the document?</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 }}>
              {[["end","At the end"],["beginning","At the start"],["newpage","New page"]].map(([v,l]) => (
                <button key={v} style={s.posBtn(position === v)} onClick={() => setPosition(v)}>{l}</button>
              ))}
            </div>

            <label style={s.label}>How long should it take?</label>
            <div style={s.grid3}>
              {[[30,"30","min"],[60,"1","hr"],[120,"2","hrs"],[180,"3","hrs"],[240,"4","hrs"],[300,"5","hrs"]].map(([v,n,u]) => (
                <button key={v} style={s.durBtn(duration === v)} onClick={() => setDuration(v as number)}>
                  <span style={s.durNum(duration === v)}>{n}</span>
                  <span style={s.durUnit(duration === v)}>{u}</span>
                </button>
              ))}
            </div>

            <label style={s.label}>Typing rhythm</label>
            <select style={s.select} value={feel} onChange={e => setFeel(e.target.value)}>
              <option value="natural">Natural — speeds up and slows down</option>
              <option value="steady">Steady — even pace throughout</option>
              <option value="slow">Slow & deliberate — long pauses</option>
            </select>

            {error && <div style={s.errorBox}>⚠️ {error}</div>}
            <button style={s.startBtn(!!(text.trim() && duration))} disabled={!text.trim() || !duration} onClick={startDrip}>
              🐢 Start SlowType
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </div>
  );

  // RUNNING
  return (
    <div>
      <Nav />
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.cardHead}><div style={s.cardIcon}>{done ? "🎉" : "🐢"}</div><div><div style={s.cardTitle}>{done ? "All done!" : "SlowType is running"}</div><div style={{ ...s.cardSub, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedDoc?.name}</div></div></div>
          <div style={s.cardBody}>
            <div style={s.runRow}>
              {!done && <div style={s.pulse} />}
              <span style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{done ? "Every character is in your doc!" : paused ? "Paused" : "Typing your text…"}</span>
              {!done && <span style={{ marginLeft: "auto", fontSize: 13, color: C.muted }}>{minsLeft > 0 ? `~${minsLeft} min left` : "finishing…"}</span>}
            </div>
            <div style={s.progTrack}><div style={s.progFill(pct)} /></div>
            <div style={s.pctRow}>
              <span>{charIndex.toLocaleString()} of {totalChars.toLocaleString()} characters</span>
              <span>{pct}%</span>
            </div>
            <div style={s.badge}>📄 <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{selectedDoc?.name}</strong><span style={{ opacity: 0.6, flexShrink: 0 }}>· {duration} {(duration ?? 0) < 60 ? "min" : "hr"}</span></div>
            {error && <div style={s.errorBox}>⚠️ {error}</div>}
            {!done ? (
              <>
                <div style={s.actionRow}>
                  <button style={s.pauseBtn} onClick={togglePause}>{paused ? "▶ Resume" : "⏸ Pause"}</button>
                  <button style={s.stopBtn} onClick={stopDrip}>⏹ Stop</button>
                </div>
                <div style={s.tip}>⚠️ Keep this tab open — SlowType runs in your browser. You can minimize the window but don't close this tab!</div>
              </>
            ) : (
              <button style={s.startBtn(true)} onClick={() => { setScreen("setup"); setText(""); setDuration(null); setDone(false); }}>Type something else →</button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </div>
  );
}
