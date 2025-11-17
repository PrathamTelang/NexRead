import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  const endpoints = {
    v1: `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
    v1beta: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  };

  const results: Record<string, any> = {};

  await Promise.all(
    Object.entries(endpoints).map(async ([k, url]) => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        try {
          results[k] = { status: res.status, body: JSON.parse(text) };
        } catch (e) {
          results[k] = { status: res.status, bodyText: text };
        }
      } catch (err: any) {
        results[k] = { error: err?.message || String(err) };
      }
    })
  );

  return NextResponse.json({ models: results });
}
