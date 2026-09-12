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
  const configured = process.env.APP_PASSWORD ?? "";
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: "Password is not configured on the server." },
      { status: 500 }
    );
  }
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (password.length !== 9 || !hasLetter(password) || !hasNumber(password) || !hasSymbol(password)) {
    return NextResponse.json(
      { ok: false, error: "Password must be 9 characters with letters, numbers, and a symbol." },
      { status: 401 }
    );
  }

  if (password !== configured) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
