"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KebabMenu } from "@/app/_components/kebab-menu";

type Identity = {
  type: "user" | "anonymous" | "guest";
  id?: string;
  label?: string;
};

type Props = {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string | null; email: string };
  };
  identity: Identity;
  isMine: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export function PostView({ post, identity, isMine, canEdit, canDelete }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Opravdu smazat příspěvek?")) return;
    setPending(true);
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Smazání selhalo.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Uložení selhalo.");
      setPending(false);
      return;
    }
    setPending(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="room-panel section"
        style={{ display: "block", padding: 0 }}
      >
        <div className="room-panel__content">
          <div className="form-row">
            <label htmlFor="edit-title">Titulek</label>
            <input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              className="field"
            />
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label htmlFor="edit-content">Obsah</label>
            <textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className="field"
            />
          </div>
          {error && <p className="form-error--block form-error">{error}</p>}
        </div>
        <div className="room-panel__footer" style={{ justifyContent: "flex-start" }}>
          <button type="submit" disabled={pending} className="btn btn--primary">
            {pending ? "Ukládám…" : "Uložit"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setTitle(post.title);
              setContent(post.content);
              setError(null);
            }}
            className="btn"
          >
            Zrušit
          </button>
        </div>
      </form>
    );
  }

  const menuItems = [];
  if (canEdit) menuItems.push({ label: "Upravit", onClick: () => setEditing(true) });
  if (canDelete) menuItems.push({ label: "Smazat", onClick: handleDelete, danger: true });

  return (
    <div className="room-panel section" style={isMine ? { background: "var(--accent-soft)" } : undefined}>
      <div className="room-panel__content">
        <div
          className="room-panel__header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}
        >
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>
              {post.title}
              {isMine && <span className="room-mine-badge">ty</span>}
            </h1>
            <div className="room-meta">
              Vytvořil: {post.author.name ?? post.author.email} ·{" "}
              {new Date(post.createdAt).toLocaleString("cs-CZ")}
            </div>
          </div>
          {menuItems.length > 0 && <KebabMenu items={menuItems} />}
        </div>
        <p className="room-body">{post.content}</p>
      </div>

      {identity.type !== "guest" ? (
        <RootCommentForm postId={post.id} />
      ) : (
        <div className="room-panel__comment-form">
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Pro psaní komentáře si nahoře nastav přezdívku, nebo se přihlas.
          </p>
        </div>
      )}
    </div>
  );
}

function RootCommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId: null }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Nepodařilo se odeslat.");
      setPending(false);
      return;
    }
    setContent("");
    setPending(false);
    window.dispatchEvent(new Event("scriptum:refresh-comments"));
  }

  return (
    <form onSubmit={handleSubmit} className="room-panel__comment-form">
      <p className="room-panel__comment-form-title">Zapojte se do diskuze</p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Napiš komentář…"
        required
        maxLength={2000}
        className="field"
      />
      {error && <p className="form-error" style={{ margin: 0 }}>{error}</p>}
      <div className="room-panel__comment-form-actions">
        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? "Odesílám…" : "Sdílet"}
        </button>
      </div>
    </form>
  );
}
