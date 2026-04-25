import React, { useState, useEffect } from "react";
import { getTicketComments, addTicketComment } from "./api/campusApi";
import { dispatchTicketNotification } from "./ticketNotifications";

export default function ATicketComments({ ticketId, authUser, ticketCreatorId, ticketTitle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getTicketComments(ticketId);
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const added = await addTicketComment(ticketId, newComment, {
        userId: authUser?.userId,
        role: authUser?.role,
      });
      setComments((prev) => [...prev, added]);
      setNewComment("");

      // If the commenter is NOT the creator, notify the creator
      if (authUser?.userId !== ticketCreatorId && ticketCreatorId && ticketTitle) {
        dispatchTicketNotification({
          type: "NEW_COMMENT",
          ticketId,
          ticketTitle,
          creatorId: ticketCreatorId,
          message: `💬 ${authUser?.fullName || "Staff"} added a comment to your ticket "${ticketTitle}".`,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Only show the comment form if user is authorized:
  // - Admins always
  // - User who is the ticket creator (checked server-side too)
  // - Maintenance assigned to this ticket (checked server-side too)
  const canComment = !!authUser;

  return (
    <div className="ticket-comments-section" style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>💬 Comments</h4>
      {error && <p className="message error">{error}</p>}

      {loading ? (
        <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: "0.85rem", opacity: 0.5, margin: "0 0 0.75rem 0" }}>No comments yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.75rem 0" }}>
          {comments.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", opacity: 0.75, marginBottom: "0.15rem" }}>
                <strong>{c.authorName}</strong>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {canComment && (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "inherit" }}
          />
          <button type="submit" style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "none", background: "#4a9eff", color: "#fff", cursor: "pointer" }}>Post</button>
        </form>
      )}
    </div>
  );
}
