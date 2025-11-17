import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { id, length } = payload || {};

    if (!id) {
      return NextResponse.json({ error: "Missing book id" }, { status: 400 });
    }

    // Fetch book info. Try Google Books first; if that fails (or the id
    // looks like an OpenLibrary id) fall back to OpenLibrary and synthesize
    // a `volumeInfo` shape so the rest of the code can remain unchanged.
    let data: any = null;
    try {
      const bookRes = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      if (bookRes.ok) {
        data = await bookRes.json();
      }
    } catch (e) {
      // ignore and try fallback
    }

    // If Google Books didn't return usable data, and the id looks like
    // an OpenLibrary id (starts with "OL") try OpenLibrary.
    if (!data || !data.volumeInfo) {
      if (id && String(id).startsWith("OL")) {
        try {
          // Prefer works endpoint for work ids (OL...W). For book editions
          // the id may end with M; try both patterns gracefully.
          const tryWork = `https://openlibrary.org/works/${id}.json`;
          const tryBook = `https://openlibrary.org/books/${id}.json`;
          let olJson: any = null;

          const workRes = await fetch(tryWork);
          if (workRes.ok) {
            olJson = await workRes.json();
            // Build a volumeInfo-like object
            const volumeInfo: any = { title: olJson.title, authors: [], imageLinks: undefined };
            if (Array.isArray(olJson.covers) && olJson.covers.length > 0) {
              volumeInfo.imageLinks = { thumbnail: `https://covers.openlibrary.org/b/id/${olJson.covers[0]}-L.jpg` };
            }
            if (Array.isArray(olJson.authors) && olJson.authors.length > 0) {
              const names = await Promise.all(
                olJson.authors.map(async (a: any) => {
                  try {
                    const key = a.author?.key || a.key || a;
                    if (!key) return null;
                    const ar = await fetch(`https://openlibrary.org${key}.json`);
                    if (ar.ok) {
                      const aj = await ar.json();
                      return aj.name;
                    }
                  } catch (e) {
                    // ignore
                  }
                  return null;
                })
              );
              volumeInfo.authors = names.filter(Boolean);
            }
            data = { volumeInfo };
          } else {
            // Try books endpoint as fallback
            const bookRes2 = await fetch(tryBook);
            if (bookRes2.ok) {
              const bookJson = await bookRes2.json();
              const volumeInfo: any = {
                title: bookJson.title,
                authors: (bookJson.authors || []).map((a: any) => a.name).filter(Boolean),
                imageLinks: bookJson.covers && bookJson.covers.length > 0
                  ? { thumbnail: `https://covers.openlibrary.org/b/id/${bookJson.covers[0]}-L.jpg` }
                  : undefined,
              };
              data = { volumeInfo };
            }
          }
        } catch (e) {
          // ignore and fall through to error below
        }
      }
    }

    if (!data || !data.volumeInfo) {
      return NextResponse.json({ error: "Could not fetch book info" }, { status: 502 });
    }

    const title = data?.volumeInfo?.title || "Unknown title";
    const author = (data?.volumeInfo?.authors || []).join(", ") || "Unknown";

    const isInsights = length === "insights";
    const pages = isInsights ? 2 : length === "short" ? 5 : length === "medium" ? 10 : 20;

    let prompt = "";
    if (isInsights) {
      prompt = `You are an expert summarizer. Produce 8-12 concise insights for the book "${title}" by ${author}. Format the output as numbered or bulleted items. For each insight include a short heading (3-6 words) followed by 1-2 short sentences explaining the insight and why it matters. Keep each item skimmable and actionable; use simple language and include a brief concrete example where helpful.`;
    } else {
      prompt = `Generate a ${pages}-page detailed book summary.\n\nTitle: ${title}\nAuthor: ${author}\n\nInclude:\n- Chapter breakdown\n- Key ideas\n- Major themes\n- Important lessons\n- Quotes (if known)\n- Real examples and explanations`;
    }

    // Ensure API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set in environment" }, { status: 500 });
    }

    // Gemini Client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    // Try with retry/backoff for transient errors and fallback to alternate models.
    const defaultModel = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    const fallbackModels = [
      defaultModel,
      "models/gemini-2.5-pro",
      "models/gemini-2.5-flash-lite",
      "models/gemini-2.0-flash",
      "models/gemini-flash-latest",
    ];

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const errors: Record<string, any> = {};

    for (const modelName of fallbackModels) {
      // for each model try a few times with exponential backoff
      const maxAttempts = 3;
      let attempt = 0;
      while (attempt < maxAttempts) {
        attempt++;
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const summary = response.text();
          return NextResponse.json({ summary, model: modelName, attempt });
        } catch (e: any) {
          const msg = e?.message || String(e);
          errors[`${modelName}@${attempt}`] = msg;
          // If error looks transient (503 Service Unavailable or network), retry
          const isTransient = /503|Service Unavailable|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(msg);
          if (!isTransient) break; // don't retry on permanent errors
          // small exponential backoff
          const backoffMs = 200 * Math.pow(2, attempt - 1);
          await sleep(backoffMs);
          // continue to next attempt
        }
      }
      // try next model
    }

    // If we reach here none of the models succeeded. Attempt to list models for diagnostics.
    let modelsInfo: any = null;
    try {
      if (typeof (genAI as any).listModels === "function") {
        modelsInfo = await (genAI as any).listModels();
      }
    } catch (listErr: any) {
      modelsInfo = { error: `Could not list models: ${listErr?.message || listErr}` };
    }

    return NextResponse.json(
      {
        error: "All models failed after retries",
        attempted: fallbackModels,
        errors,
        models: modelsInfo,
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err?.message || err}` }, { status: 500 });
  }
}
