import React, { useState } from "react";

export const TelemedAndAiView: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "assistant", prompt }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("The AI service did not return a valid response. Please try again later.");
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI assistance is unavailable.");
      if (typeof data.result !== "string" || !data.result.trim()) throw new Error("No AI response was returned.");
      setResult(data.result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reach the AI service.");
    } finally {
      setPending(false);
    }
  };
  return (
    <section className="max-w-3xl space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <h1 className="text-2xl font-bold">AI assistance & telemedicine</h1>
      <p className="text-slate-300">Live AI and video consultations are not connected yet. No microphone or camera is recording.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold" htmlFor="assistant-prompt">Test request — fictional information only</label>
        <textarea id="assistant-prompt" required maxLength={4000} value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full min-h-32 bg-slate-950 border border-slate-700 rounded-xl p-3" />
        <button disabled={pending || !prompt.trim()} className="bg-teal-600 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold">
          {pending ? "Checking service…" : "Check AI service"}
        </button>
      </form>
      {error && <p role="alert" className="text-amber-300">{error}</p>}
      {result && <p className="whitespace-pre-wrap">{result}</p>}
    </section>
  );
};
