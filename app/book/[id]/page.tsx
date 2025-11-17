"use client";

import React, { useState, useRef, useEffect } from "react";

export default function BookPage({ params }: any) {
  // In some Next.js versions `params` may be a Promise when passed
  // into a client component. The runtime suggests unwrapping it
  // with `React.use()` before accessing properties.
  // Fall back to the raw `params` if `React.use` isn't available.
  const resolvedParams = (React as any).use ? (React as any).use(params) : params;

  const [summary, setSummary] = useState("");
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<any | null>(null);
  const [paused, setPaused] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0); // in characters
  const progressTimerRef = useRef<number | null>(null);

  const CHARS_PER_SECOND = 19; // heuristic for seeking (words/sec * avg chars)

  // Fetch book metadata (cover, title, authors) on mount.
  // Try Google Books first; if that fails (or the id looks like an
  // OpenLibrary id) fall back to OpenLibrary so OL ids work.
  React.useEffect(() => {
    let canceled = false;
    const fetchInfo = async () => {
      setLoadingInfo(true);
      try {
        // Try Google Books API first
        try {
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${resolvedParams.id}`);
          if (res.ok) {
            const json = await res.json();
            if (!canceled) {
              setBookInfo(json);
              return;
            }
          }
        } catch (e) {
          // ignore and fall through to OpenLibrary fallback
        }

        // If the id looks like an OpenLibrary id (starts with "OL")
        // or Google Books did not return a usable response, try OpenLibrary.
        if (resolvedParams.id && String(resolvedParams.id).startsWith("OL")) {
          try {
            const workRes = await fetch(`https://openlibrary.org/works/${resolvedParams.id}.json`);
            if (workRes.ok) {
              const workJson = await workRes.json();

              const volumeInfo: any = {
                title: workJson.title,
                authors: [],
              };

              if (Array.isArray(workJson.covers) && workJson.covers.length > 0) {
                volumeInfo.imageLinks = { thumbnail: `https://covers.openlibrary.org/b/id/${workJson.covers[0]}-L.jpg` };
              }

              // Fetch author names in parallel (best-effort)
              if (Array.isArray(workJson.authors) && workJson.authors.length > 0) {
                const names = await Promise.all(
                  workJson.authors.map(async (a: any) => {
                    try {
                      const ar = await fetch(`https://openlibrary.org${a.author.key}.json`);
                      if (ar.ok) {
                        const aj = await ar.json();
                        return aj.name;
                      }
                    } catch (e) {
                      // ignore individual author fetch errors
                    }
                    return null;
                  })
                );
                volumeInfo.authors = names.filter(Boolean);
              }

              if (!canceled) setBookInfo({ volumeInfo });
              return;
            }
          } catch (e) {
            // ignore OpenLibrary errors and leave bookInfo null
          }
        }
      } finally {
        if (!canceled) setLoadingInfo(false);
      }
    };

    fetchInfo();
    return () => { canceled = true; };
  }, [resolvedParams.id]);

  const generate = async (length: string) => {
    setGenerating(true);
    setSummary(length === 'insights' ? 'Generating insights...' : 'Generating summary...');
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resolvedParams.id, length }),
      });

      // Defensive: always try to parse JSON; if the API returns an error
      // object we'll handle it gracefully.
      const data = await res.json();
      const text = data.summary || data.error || "No summary returned.";
      setSummary(text);
      // reset offsets whenever a new summary is set
      setCurrentOffset(0);
      setPaused(false);
      setSpeaking(false);
    } finally {
      setGenerating(false);
    }
  };

  // Text-to-speech: uses the browser SpeechSynthesis API (best-effort).
  const handleListenToggle = () => {
    try {
      const synth = (window as any).speechSynthesis;
      if (!synth) {
        alert("Text-to-speech is not supported in your browser.");
        return;
      }
      if (!summary) return;

      if (speaking) {
        // pause playback
        try {
          synth.pause();
          setPaused(true);
          setSpeaking(false);
          // compute new offset based on time played
          if (utterRef.current && utterRef.current.startAt) {
            const base = utterRef.current.offset || 0;
            const elapsedMs = Date.now() - utterRef.current.startAt;
            const added = Math.floor((elapsedMs / 1000) * CHARS_PER_SECOND);
            const newOffset = Math.min(summary.length, base + added);
            setCurrentOffset(newOffset);
            // Only mutate the utterance base offset if we're NOT using
            // boundary events (timer fallback). If boundary events are
            // available we must NOT change the utterance's base offset
            // because onboundary emits charIndex relative to the
            // original utterance text.
            if (!utterRef.current.useBoundary) {
              utterRef.current.offset = newOffset;
            }
          }
          if (progressTimerRef.current) {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
        } catch (e) {
          console.error("Pause failed", e);
        }
        return;
      }

      if (paused) {
        // resume
        try {
          synth.resume();
          setSpeaking(true);
          setPaused(false);
          // If we don't have boundary events, reset the startAt so the
          // fallback timer measures elapsed from this resume moment.
          if (utterRef.current && !utterRef.current.useBoundary) {
            utterRef.current.startAt = Date.now();
          }
          if (!progressTimerRef.current) startProgressTimer();
        } catch (e) {
          console.error("Resume failed", e);
        }
        return;
      }

      // neither playing nor paused -> start from current offset
      startFromOffset(currentOffset);
    } catch (e) {
      // best-effort; don't block the UI
      console.error("TTS error", e);
      setSpeaking(false);
    }
  };

  const handlePause = () => {
    try {
      const synth = (window as any).speechSynthesis;
      if (!synth) return;
      if (speaking) {
        synth.pause();
        setPaused(true);
        setSpeaking(false);
        if (utterRef.current && utterRef.current.startAt) {
          const base = utterRef.current.offset || 0;
          const elapsedMs = Date.now() - utterRef.current.startAt;
          const added = Math.floor((elapsedMs / 1000) * CHARS_PER_SECOND);
          const newOffset = Math.min(summary.length, base + added);
          setCurrentOffset(newOffset);
          if (!utterRef.current.useBoundary) {
            utterRef.current.offset = newOffset;
          }
        }
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      }
    } catch (e) {
      console.error("pause error", e);
    }
  };

  const startFromOffset = (offsetChars: number) => {
    try {
      const synth = (window as any).speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const text = summary.slice(Math.max(0, Math.min(summary.length, Math.floor(offsetChars))));
      if (!text) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 1;
      u.onstart = () => {
        setSpeaking(true);
        setPaused(false);
        // set base offset; `useBoundary` will be flipped to true
        // if the browser emits boundary events (more accurate).
        utterRef.current = { offset: offsetChars, startAt: Date.now(), useBoundary: false };
        if (!progressTimerRef.current) startProgressTimer();
      };
      // Prefer onboundary events when available (gives charIndex within
      // the utterance). Use them to update `currentOffset` precisely.
      try {
        if (typeof (u as any).onboundary !== "undefined") {
          (u as any).onboundary = (e: any) => {
            try {
              // e.charIndex is the index within the utterance text
              if (typeof e.charIndex === "number") {
                // mark that we're using boundary events
                if (utterRef.current) utterRef.current.useBoundary = true;
                const base = utterRef.current?.offset || 0;
                const charIdx = base + e.charIndex;
                setCurrentOffset(Math.min(summary.length, charIdx));
              }
            } catch (err) {
              // ignore boundary handling errors
            }
          };
        }
      } catch (e) {
        // ignore assignment errors in older browsers
      }
      u.onend = () => {
        setSpeaking(false);
        setPaused(false);
        utterRef.current = null;
        setCurrentOffset(0);
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      };
      u.onerror = () => {
        setSpeaking(false);
        setPaused(false);
        utterRef.current = null;
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      };
      utterRef.current = { ...utterRef.current, utter: u, offset: offsetChars };
      synth.speak(u);
    } catch (e) {
      console.error("startFromOffset error", e);
    }
  };

  const startProgressTimer = () => {
    progressTimerRef.current = window.setInterval(() => {
      try {
        if (!utterRef.current) return;
        // If the browser provides boundary events, prefer them; the
        // timer is only a fallback and shouldn't overwrite accurate updates.
        if (utterRef.current.useBoundary) return;
        const baseOffset = utterRef.current.offset || 0;
        const elapsedMs = Date.now() - (utterRef.current.startAt || Date.now());
        const added = (elapsedMs / 1000) * CHARS_PER_SECOND;
        const newOffset = Math.min(summary.length, Math.floor(baseOffset + added));
        setCurrentOffset(newOffset);
      } catch (e) {
        // ignore
      }
    }, 400);
  };

  const handleSeek = (deltaSeconds: number) => {
    try {
      if (!summary) return;
      // compute new offset in chars
      let newOffset = Math.max(0, Math.floor(currentOffset + deltaSeconds * CHARS_PER_SECOND));
      newOffset = Math.min(newOffset, summary.length - 1);
      // restart playback from new offset
      startFromOffset(newOffset);
      setCurrentOffset(newOffset);
    } catch (e) {
      console.error("seek error", e);
    }
  };

  // Ensure we stop speaking if the component unmounts
  useEffect(() => {
    return () => {
      try {
        const synth = (window as any).speechSynthesis;
        if (synth) synth.cancel();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const tokens = React.useMemo(() => (summary ? summary.split(/(\s+)/) : []), [summary]);
  const copySummary = async () => {
    try {
      if (!summary) return;
      await navigator.clipboard.writeText(summary);
      alert('Summary copied to clipboard');
    } catch (e) {
      console.error('copy failed', e);
      alert('Copy failed');
    }
  };

  const pct = summary && summary.length ? Math.min(100, Math.floor((currentOffset / summary.length) * 100)) : 0;

  return (
    <main className="p-6 min-w-screen min-h-screen  bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">{bookInfo?.volumeInfo?.title || 'Generate Book Summary'}</h1>
          <p className="text-lg text-gray-300 max-w-xl ">{bookInfo?.volumeInfo?.authors?.join(', ') || 'Unknown author'}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <aside className="md:col-span-1">
            <div className="card p-4 flex flex-col items-center text-center rounded-lg border   border-gray-200/10 shadow-[inset_-12px_-8px_40px_#46464620]">
              {loadingInfo && <p className="muted">Loading book info...</p>}
              {bookInfo?.volumeInfo?.imageLinks?.thumbnail ? (
                <img
                  src={bookInfo.volumeInfo.imageLinks.thumbnail}
                  alt={bookInfo.volumeInfo.title}
                  className="w-48 h-auto mb-4 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]"
                />
              ) : (
                <div className="w-48 h-64 rounded-lg bg-gradient-to-br from-gray-200 to-gray-100 mb-4 flex items-center justify-center">No cover</div>
              )}

              <h2 className="font-semibold text-lg">{bookInfo?.volumeInfo?.title || 'Unknown Title'}</h2>
              <p className="muted mb-3">{bookInfo?.volumeInfo?.authors?.join(', ') || 'Unknown Author'}</p>

              <div className="flex gap-2">
                <a
                  className="btn-primary"
                  href={bookInfo?.volumeInfo?.infoLink || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Source
                </a>
                <button className="btn-outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Top
                </button>
              </div>
            </div>
          </aside>

          <section className="md:col-span-2 bg-white/5 p-4 rounded-lg border border-gray-200/10 shadow-[inset_-12px_-8px_40px_#46464620]">
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <button className="btn-primary group h-10 px-2 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2" onClick={() => generate('short')} disabled={generating} aria-busy={generating}>
                {generating ? 'Generating…' : 'Quick summary'}
              </button>
              <button className="btn-primary group h-10 px-2 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2" onClick={() => generate('insights')} disabled={generating}>Insights</button>
              <button className="btn-primary group h-10 px-2 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2" onClick={() => generate('long')} disabled={generating}>Deep Dive</button>

              <div className="ml-auto flex gap-2">
                <button className="btn-outline h-8 px-2 cursor-pointer  bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/50 rounded-lg font-semibold text-white transition-all" onClick={copySummary} disabled={!summary}>Copy</button>
                <button
                  className="btn-outline cursor-pointer h-8 px-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/50 rounded-lg font-semibold text-white transition-all"
                  onClick={() => {
                    if (!summary) return;
                    const w = window.open();
                    w?.document.write(`<pre>${summary.replace(/</g, '&lt;')}</pre>`);
                  }}
                  disabled={!summary}
                >
                  Open
                </button>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-2 items-center">
                  <button
                    className="btn-primary"
                    onClick={() => handleSeek(-10)}
                    disabled={generating}
                    aria-label="Rewind 10 seconds"
                    title="Rewind 10s"
                  >
                    « 10s
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => handleListenToggle()}
                    disabled={generating}
                    aria-pressed={speaking}
                    aria-label={speaking ? 'Pause' : paused ? 'Resume' : 'Play'}
                  >
                    {speaking ? 'Pause' : paused ? 'Resume' : 'Play'}
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => handleSeek(10)}
                    disabled={generating}
                    aria-label="Forward 10 seconds"
                    title="Forward 10s"
                  >
                    10s »
                  </button>
                </div>

                <div className="ml-3 text-sm muted">{speaking ? 'Playing summary…' : paused ? 'Paused' : 'Tap Play to hear the summary'}</div>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mb-3">
                <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>

              <div className="max-h-96 overflow-auto prose prose-lg whitespace-pre-line leading-relaxed">
                {summary ? (
                  <div key={summary}>
                    {tokens.map((t, i) => {
                      const isWhitespace = /^\s+$/.test(t);
                      let start = 0;
                      for (let j = 0; j < i; j++) start += tokens[j].length;
                      const end = start + t.length;
                      const active = !isWhitespace && currentOffset >= start && currentOffset < end;
                      return (
                        <span
                          key={i}
                          style={{
                            backgroundColor: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                            transition: 'background-color 160ms ease',
                          }}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="muted">No summary yet. Choose a length to generate.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
