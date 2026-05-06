"use client";

import { useEffect, useState, useCallback } from "react";
import { KebabMenu } from "@/app/_components/kebab-menu";

type Comment = {
  id: string;
  content: string;
  deleted: boolean;
  createdAt: string;
  parentId: string | null;
  authorId: string | null;
  anonymousId: string | null;
  author: { id: string; name: string | null; email: string } | null;
  anonymous: { id: string; nickname: string } | null;
};

type Identity = {
  type: "user" | "anonymous" | "guest";
  id?: string;
  label?: string;
};

export function CommentsSection({
  postId,
  identity,
}: {
  postId: string;
  identity: Identity;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`, { cache: "no-store" });
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    const handler = () => load();
    window.addEventListener("scriptum:refresh-comments", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scriptum:refresh-comments", handler);
    };
  }, [load]);

  const tree = buildTree(comments);

  return (
    <>
      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
          Načítám…
        </p>
      ) : tree.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
          Zatím žádné komentáře.
        </p>
      ) : (
        <ul className="list">
          {tree.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              postId={postId}
              identity={identity}
              onChange={load}
              depth={0}
            />
          ))}
        </ul>
      )}
    </>
  );
}

type TreeNode = Comment & { children: TreeNode[] };

function buildTree(list: Comment[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  list.forEach((c) => map.set(c.id, { ...c, children: [] }));
  map.forEach((node) => {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function CommentNode({
  comment,
  postId,
  identity,
  onChange,
  depth,
}: {
  comment: TreeNode;
  postId: string;
  identity: Identity;
  onChange: () => void;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [savePending, setSavePending] = useState(false);

  const authorLabel =
    comment.author?.name ??
    comment.author?.email ??
    comment.anonymous?.nickname ??
    "Anonym";

  const isAnon = comment.author === null && !!comment.anonymous;

  const isOwner =
    !comment.deleted &&
    ((identity.type === "user" && comment.authorId === identity.id) ||
      (identity.type === "anonymous" && comment.anonymousId === identity.id));

  async function handleDelete() {
    if (!confirm("Smazat komentář?")) return;
    const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    if (res.ok) onChange();
    else alert("Smazání selhalo.");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavePending(true);
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setSavePending(false);
    if (res.ok) {
      setEditing(false);
      onChange();
    } else {
      alert("Uložení selhalo.");
    }
  }

  return (
    <li
      id={`c-${comment.id}`}
      className={`comment-item${depth > 0 ? " comment-item--reply" : ""}${
        comment.deleted ? " comment-item--deleted" : ""
      }${isOwner ? " comment-item--mine" : ""}`}
    >
      <div className="comment-header">
        <div>
          <strong>{authorLabel}</strong>
          {isOwner && <span className="comment-mine-badge">ty</span>}
          {isAnon && <span className="comment-tag">anonym</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{new Date(comment.createdAt).toLocaleString("cs-CZ")}</span>
          {isOwner && !editing && (
            <KebabMenu
              items={[
                { label: "Upravit", onClick: () => setEditing(true) },
                { label: "Smazat", onClick: handleDelete, danger: true },
              ]}
            />
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSaveEdit} style={{ marginTop: 4 }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            required
            rows={3}
            maxLength={2000}
            className="field"
            style={{ marginBottom: 6 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button type="submit" disabled={savePending} className="btn btn--primary btn--small">
              {savePending ? "…" : "Uložit"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditContent(comment.content);
              }}
              className="btn btn--small"
            >
              Zrušit
            </button>
          </div>
        </form>
      ) : (
        <p className="comment-body">
          {comment.deleted ? "[odstraněno uživatelem]" : comment.content}
        </p>
      )}

      {!comment.deleted && !editing && identity.type !== "guest" && (
        <div className="comment-actions">
          <button
            onClick={() => setReplying((v) => !v)}
            className="comment-action-button"
          >
            {replying ? "Zrušit" : "Odpovědět"}
          </button>
        </div>
      )}

      {replying && (
        <ReplyForm
          postId={postId}
          parentId={comment.id}
          onPosted={() => {
            setReplying(false);
            onChange();
          }}
        />
      )}

      {comment.children.length > 0 && (
        <ul className="reply-list">
          {comment.children.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              postId={postId}
              identity={identity}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function ReplyForm({
  postId,
  parentId,
  onPosted,
}: {
  postId: string;
  parentId: string;
  onPosted: () => void;
}) {
  return (
    <CommentFormBody
      postId={postId}
      parentId={parentId}
      onPosted={onPosted}
      placeholder="Napiš odpověď…"
      className="reply-form"
    />
  );
}

function CommentFormBody({
  postId,
  parentId,
  onPosted,
  placeholder,
  className,
  style,
}: {
  postId: string;
  parentId: string | null;
  onPosted: () => void;
  placeholder: string;
  className: string;
  style?: React.CSSProperties;
}) {
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
      body: JSON.stringify({ content, parentId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Nepodařilo se odeslat.");
      setPending(false);
      return;
    }
    setContent("");
    setPending(false);
    onPosted();
  }

  return (
    <form onSubmit={handleSubmit} className={className} style={style}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        required
        maxLength={2000}
        className="field"
      />
      <button type="submit" disabled={pending} className="btn btn--primary btn--small">
        {pending ? "…" : "Sdílet"}
      </button>
      {error && <p className="form-error" style={{ width: "100%", margin: "6px 0 0" }}>{error}</p>}
    </form>
  );
}
