"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Nepodařilo se uložit.");
      setPending(false);
      return;
    }

    const post = await res.json();
    router.push(`/posts/${post.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-card form-card--wide">
      <h1 className="form-card__title">Nový příspěvek</h1>
      <p className="form-card__subtitle">Napiš co máš na srdci.</p>

      <div className="form-row">
        <label htmlFor="title">Titulek</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={200}
          className="field"
        />
      </div>

      <div className="form-row">
        <label htmlFor="content">Obsah</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          className="field"
        />
      </div>

      {error && <p className="form-error--block form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? "Ukládám…" : "Publikovat"}
        </button>
      </div>
    </form>
  );
}
