import React, { useState, useEffect } from "react";
import { getTicketComments, addTicketComment } from "./api/campusApi";
import { createNotification } from "./notificationUtils";
import { dispatchTicketNotification } from "./ticketNotifications";

export default function ATicketComments({
  ticketId,
  authUser,
  ticketTitle,
  ticketCreatorId,
  addSystemNotification,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadComments();
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const added = await addTicketComment(ticketId, newComment, {
        userId: authUser?.userId,
        role: authUser?.role,
      });
      setComments((prev) => [...prev, added]);
      if (
        ticketCreatorId &&
        authUser?.userId &&
        String(authUser.userId) !== String(ticketCreatorId)
      ) {
        addSystemNotification?.(
          createNotification({
            type: "TICKET_COMMENT_ADDED",
            category: "TICKET",
            recipientUserId: ticketCreatorId,
            title: `New comment on "${ticketTitle || `Ticket #${ticketId}`}"`,
            message: `${added.authorName || "A team member"} added a new comment to your ticket.`,
          })
        );
      }
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

  const canComment = !!authUser;

  return (
    <div className="ticket-comments-container">
      <div className="comments-header">
        <h4>💬 Activity & Responses</h4>
        {comments.length > 0 && <span className="comment-count-badge">{comments.length}</span>}
      </div>
      
      {error && <p className="message error">{error}</p>}

      <div className="comments-scroll-area">
        {loading ? (
          <p className="loading-small">Loading comments...</p>
        ) : comments.length === 0 ? (
          <div className="comments-empty-state">
            <p>No activity yet. Staff will post updates here.</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((c) => {
              const isStaff = c.authorRole === "ADMIN" || c.authorRole === "MAINTENANCE";
              return (
                <div key={c.id} className={`comment-bubble ${isStaff ? 'staff-response' : 'user-comment'}`}>
                  <div className="comment-meta">
                    <span className="author-name">
                      {c.authorName}
                      {isStaff && <span className="staff-badge">OFFICIAL STAFF</span>}
                    </span>
                    <span className="comment-time">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="comment-body">{c.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canComment && (
        <form onSubmit={handleSubmit} className="comment-input-form">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a response..."
            required
          />
          <button type="submit" className="send-comment-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      )}

      <style jsx>{`
        .ticket-comments-container {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .comments-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comments-header h4 {
          margin: 0;
          font-size: 0.82rem;
          font-weight: 800;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .comment-count-badge {
          background: #e2e8f0;
          color: #4a5568;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 6px;
        }

        .comments-scroll-area {
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .comment-bubble {
          padding: 0.75rem;
          border-radius: 14px;
          background: #f7fafc;
          border: 1px solid #edf2f7;
        }

        .comment-bubble.staff-response {
          background: #ebf8ff;
          border: 1px solid #bee3f8;
          box-shadow: 0 2px 4px rgba(66, 153, 225, 0.1);
        }

        .comment-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.35rem;
        }

        .author-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .staff-badge {
          background: #3182ce;
          color: white;
          font-size: 0.6rem;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }

        .comment-time {
          font-size: 0.7rem;
          color: #a0aec0;
        }

        .comment-body {
          margin: 0;
          font-size: 0.88rem;
          color: #4a5568;
          line-height: 1.4;
        }

        .comment-input-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .comment-input-form input {
          flex: 1;
          padding: 0.6rem 0.85rem;
          font-size: 0.85rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .send-comment-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: none;
          background: #3182ce;
          color: white;
          cursor: pointer;
        }

        .send-comment-btn svg {
          width: 16px;
          height: 16px;
        }

        .comments-empty-state {
          padding: 1.5rem;
          text-align: center;
          background: #f8fafc;
          border-radius: 14px;
          border: 1px dashed #e2e8f0;
        }

        .comments-empty-state p {
          margin: 0;
          font-size: 0.8rem;
          color: #a0aec0;
        }

        .loading-small {
          font-size: 0.8rem;
          color: #a0aec0;
          padding: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
