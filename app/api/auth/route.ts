import { NextResponse } from "next/server";

function hasLetter(s: string) {
  return /[A-Za-z]/.test(s);
}
function hasNumber(s: string) {
  return /[0-9]/.test(s);
}
function hasSymbol(s: string) {
  return /[^A-Za-z0-9]/.test(s);
}

export async function POST(req: Request) {
  // Prototype owner password (server-side only, never sent to the client).
  // Overridable via APP_PASSWORD without a code change.
  const configured = process.env.APP_PASSWORD || "Cho2026!";
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (password.length < 8 || !hasLetter(password) || !hasNumber(password) || !hasSymbol(password)) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters with letters, numbers, and a symbol." },
      { status: 401 }
    );
  }

  if (password !== configured) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
