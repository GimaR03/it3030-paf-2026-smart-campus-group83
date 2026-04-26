import React, { useState, useEffect, useMemo } from "react";
import ATicketComments from "./ATicketComments";
import {
  getTicketNotifications,
  markTicketNotificationsRead,
  clearTicketNotifications,
} from "./ticketNotifications";

export default function AMaintenanceView({
  clearMessages,
  setCurrentDashboard,
  handleLogout,
  authUser,
  tickets,
  loadTickets,
  formatLabel,
  getTicketBuildingLabel,
  handleMaintenanceTicketAction,
  loading,
}) {
  const [activeView, setActiveView] = useState("feed"); // 'feed' or 'analytics'
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingTicket, setPendingTicket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [visibleTickets, setVisibleTickets] = useState([]);

  useEffect(() => {
    if (authUser?.userId) {
      const notifs = getTicketNotifications(authUser.userId);
      if (notifs) {
        setNotifications(notifs.filter((n) => !n.read));
      }
      markTicketNotificationsRead(authUser.userId);
    }
  }, [authUser]);

  // Staggered entry for tickets
  useEffect(() => {
    if (!loading && tickets.length > 0 && activeView === "feed") {
      setVisibleTickets([]);
      tickets.forEach((t, i) => {
        setTimeout(() => {
          setVisibleTickets(prev => [...prev, t]);
        }, i * 60);
      });
    } else if (tickets.length === 0) {
      setVisibleTickets([]);
    }
  }, [loading, tickets, activeView]);

  const handleRefresh = async () => {
    await loadTickets();
  };

  // Analytics Calculations
  const analytics = useMemo(() => {
    if (!tickets.length) return null;

    const total = tickets.length;
    const byCategory = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});
    
    const byPriority = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    const byStatus = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const resolvedCount = byStatus["RESOLVED"] || 0;
    const closedCount = byStatus["CLOSED"] || 0;
    const resolutionRate = total > 0 ? Math.round(((resolvedCount + closedCount) / total) * 100) : 0;

    return { total, byCategory, byPriority, byStatus, resolutionRate };
  }, [tickets]);

  const submittedTickets = tickets.filter((ticket) => ticket.status === "SUBMITTED");
  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
  const inProgressTickets = tickets.filter((ticket) => ticket.status === "IN_PROGRESS");
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED");

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "URGENT": return "prio-urgent";
      case "HIGH": return "prio-high";
      case "MEDIUM": return "prio-medium";
      default: return "prio-low";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "SUBMITTED": return "st-submitted";
      case "OPEN": return "st-open";
      case "IN_PROGRESS": return "st-progress";
      case "RESOLVED": return "st-resolved";
      default: return "st-closed";
    }
  };

  const handleActionClick = (ticket, action) => {
    setPendingTicket(ticket);
    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingTicket && pendingAction) {
      handleMaintenanceTicketAction(pendingTicket, pendingAction);
      setShowConfirmDialog(false);
      setPendingTicket(null);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingTicket(null);
    setPendingAction(null);
  };

  const getActionConfirmMessage = (action, ticket) => {
    const building = getTicketBuildingLabel(ticket.resourceId);
    const floor = ticket.userId;
    const hallLab = ticket.assignedTechnicianId || "Not specified";
    
    switch (action) {
      case "IN_PROGRESS":
        return `Start work on ticket #${ticket.id}?\n\nLocation: ${building}, Floor ${floor}\nArea: ${hallLab}`;
      case "RESOLVED":
        return `Mark ticket #${ticket.id} as Resolved?`;
      case "CANCEL":
        return `Cancel ticket #${ticket.id}?`;
      default:
        return "Proceed with this action?";
    }
  };

  return (
    <main className="maintenance-app-v6">
      <div className="v6-bg-overlay" />
      
      {/* Top Header */}
      <nav className="v6-nav">
        <div className="v6-nav-left">
          <div className="v6-logo">🔧</div>
          <div className="v6-branding">
            <span className="v6-brand-name">Operations Hub</span>
            <span className="v6-brand-tag">Maintenance Analytics</span>
          </div>
        </div>
        
        <div className="v6-nav-right">
          <div className="v6-view-switcher">
            <button className={activeView === 'feed' ? 'active' : ''} onClick={() => setActiveView('feed')}>Feed</button>
            <button className={activeView === 'analytics' ? 'active' : ''} onClick={() => setActiveView('analytics')}>Analytics</button>
          </div>
          <button className={`v6-refresh-btn ${loading ? 'loading' : ''}`} onClick={handleRefresh} disabled={loading}>
            {loading ? "Syncing..." : "Sync"}
          </button>
          <div className="v6-user-menu" onClick={handleLogout}>
             <div className="v6-user-info">
               <span className="v6-user-name">{authUser?.fullName || "Staff"}</span>
               <span className="v6-user-role">Sign Out</span>
             </div>
             <div className="v6-user-avatar">👤</div>
          </div>
        </div>
      </nav>

      <div className="v6-content-grid">
        {/* Sidebar Column */}
        <aside className="v6-sidebar">
          <section className="v6-stats-card">
            <h3 className="v6-section-title">Global Overview</h3>
            <div className="v6-stat-list">
              <div className="v6-stat-item">
                <span className="v6-stat-label">Submitted</span>
                <span className="v6-stat-val">{loading ? "..." : submittedTickets.length}</span>
              </div>
              <div className="v6-stat-item">
                <span className="v6-stat-label">Open / Ready</span>
                <span className="v6-stat-val highlight">{loading ? "..." : openTickets.length}</span>
              </div>
              <div className="v6-stat-item">
                <span className="v6-stat-label">In Progress</span>
                <span className="v6-stat-val warning">{loading ? "..." : inProgressTickets.length}</span>
              </div>
              <div className="v6-stat-item">
                <span className="v6-stat-label">Resolution Rate</span>
                <span className="v6-stat-val success">{loading ? "..." : (analytics?.resolutionRate || 0)}%</span>
              </div>
            </div>
          </section>

          {notifications.length > 0 && !loading && (
            <section className="v6-alerts-card animate-in">
              <div className="v6-alerts-header">
                <h3>Live Alerts</h3>
                <button onClick={() => { clearTicketNotifications(authUser?.userId); setNotifications([]); }}>Clear</button>
              </div>
              <div className="v6-alerts-list">
                {notifications.map(n => (
                  <div key={n.id} className="v6-alert-item">
                    <p>{n.message}</p>
                    <small>{n.timestamp}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="v6-info-card">
             <h4>System Insights</h4>
             <p>Operations are currently running at <strong>{analytics?.resolutionRate || 0}%</strong> efficiency based on closed tickets.</p>
          </section>
        </aside>

        {/* Main Area */}
        <div className="v6-main-feed">
          {activeView === 'feed' ? (
            <>
              <header className="v6-feed-header">
                <div className="v6-feed-title">
                  <h2>Ticket Feed</h2>
                  <p>{tickets.length} total tasks identified</p>
                </div>
              </header>

              <div className="v6-ticket-list">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="v6-skeleton-ticket" />)
                ) : visibleTickets.length === 0 ? (
                  <div className="v6-empty-state">
                    <div className="v6-empty-icon">☕</div>
                    <h3>No Tasks Found</h3>
                    <p>Everything is currently under control. Take a break!</p>
                  </div>
                ) : (
                  visibleTickets.map(ticket => (
                    <article key={ticket.id} className={`v6-ticket-card animate-in ${getStatusClass(ticket.status)}`}>
                      <div className="v6-ticket-header">
                        <span className="v6-ticket-id">#{ticket.id}</span>
                        <span className={`v6-prio-tag ${getPriorityClass(ticket.priority)}`}>{ticket.priority}</span>
                        <span className="v6-ticket-status">{formatLabel(ticket.status)}</span>
                      </div>

                      <div className="v6-ticket-body">
                        <h3 className="v6-ticket-title">{ticket.title}</h3>
                        <p className="v6-ticket-desc">{ticket.description}</p>
                        
                        <div className="v6-ticket-meta">
                          <div className="v6-meta-item">
                            <label>Reporter</label>
                            <span>{ticket.creatorName || "Anonymous"}</span>
                          </div>
                          <div className="v6-meta-item">
                            <label>Location</label>
                            <span>{getTicketBuildingLabel(ticket.resourceId)}, F{ticket.userId}</span>
                          </div>
                          <div className="v6-meta-item">
                            <label>Assignee</label>
                            <span className={ticket.assignedMaintenanceId ? 'assigned' : 'available'}>
                              {ticket.assignedMaintenanceId === authUser?.userId ? "You" : (ticket.assignedMaintenanceId ? "Other Staff" : "Unassigned")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="v6-ticket-actions">
                        {(ticket.status === "OPEN" || ticket.status === "SUBMITTED") && (
                          <button className="v6-action-btn primary" onClick={() => handleActionClick(ticket, "IN_PROGRESS")}>
                            {ticket.assignedMaintenanceId ? "Start Work" : "Claim & Start"}
                          </button>
                        )}
                        {ticket.status === "IN_PROGRESS" && (
                          <>
                            <button className="v6-action-btn success" onClick={() => handleActionClick(ticket, "RESOLVED")}>Resolve</button>
                            <button className="v6-action-btn danger" onClick={() => handleActionClick(ticket, "CANCEL")}>Cancel</button>
                          </>
                        )}
                      </div>

                      <div className="v6-ticket-footer">
                         <ATicketComments 
                            ticketId={ticket.id} 
                            authUser={authUser} 
                            ticketCreatorId={ticket.creatorId}
                            ticketTitle={ticket.title}
                         />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Analytics View */
            <div className="v6-analytics-container animate-in">
                <header className="v6-feed-header">
                  <div className="v6-feed-title">
                    <h2>Operations Analytics</h2>
                    <p>Performance metrics and category distribution</p>
                  </div>
                </header>

                <div className="v6-analytics-grid">
                    <section className="v6-chart-card">
                        <h3>Category Distribution</h3>
                        <div className="v6-bar-chart">
                            {Object.entries(analytics?.byCategory || {}).map(([cat, count]) => {
                                const pct = (count / analytics.total) * 100;
                                return (
                                    <div key={cat} className="v6-bar-row">
                                        <div className="v6-bar-info">
                                            <span>{formatLabel(cat)}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="v6-bar-bg">
                                            <div className="v6-bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="v6-chart-card">
                        <h3>Priority Breakdown</h3>
                        <div className="v6-priority-rings">
                            {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(prio => {
                                const count = analytics?.byPriority[prio] || 0;
                                const pct = analytics?.total > 0 ? (count / analytics.total) * 100 : 0;
                                return (
                                    <div key={prio} className="v6-prio-stat">
                                        <div className={`v6-ring ${prio.toLowerCase()}`} style={{ '--pct': pct }}>
                                            <span className="v6-ring-val">{Math.round(pct)}%</span>
                                        </div>
                                        <span className="v6-prio-label">{prio}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="v6-chart-card full-width">
                        <h3>Workload Efficiency</h3>
                        <div className="v6-efficiency-box">
                            <div className="v6-eff-main">
                                <span className="v6-eff-val">{analytics?.resolutionRate}%</span>
                                <span className="v6-eff-label">Resolution Rate</span>
                            </div>
                            <div className="v6-eff-details">
                                <p>Out of <strong>{analytics?.total}</strong> total tickets reported, <strong>{resolvedTickets.length}</strong> have been successfully resolved by the maintenance team.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Overlay */}
      {showConfirmDialog && pendingTicket && (
        <div className="v6-modal-overlay" onClick={cancelAction}>
          <div className="v6-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Action</h3>
            <p>{getActionConfirmMessage(pendingAction, pendingTicket)}</p>
            <div className="v6-modal-btns">
              <button className="v6-confirm" onClick={confirmAction}>Confirm</button>
              <button className="v6-cancel" onClick={cancelAction}>Back</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .maintenance-app-v6 {
          background-color: #0f172a;
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding-top: 80px;
        }

        .v6-bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at top right, #1e3a8a 0%, transparent 60%);
          pointer-events: none;
          opacity: 0.4;
        }

        /* Navbar */
        .v6-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 40px;
          z-index: 1000;
        }

        .v6-nav-left { display: flex; align-items: center; gap: 15px; }
        .v6-logo { font-size: 24px; background: #ffffff; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .v6-brand-name { display: block; font-weight: 800; font-size: 18px; color: #ffffff; }
        .v6-brand-tag { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

        .v6-nav-right { display: flex; align-items: center; gap: 20px; }
        
        .v6-view-switcher {
            background: rgba(255,255,255,0.05);
            padding: 4px;
            border-radius: 12px;
            display: flex;
            gap: 4px;
        }
        .v6-view-switcher button {
            background: none;
            border: none;
            color: #94a3b8;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
        }
        .v6-view-switcher button.active {
            background: #ffffff;
            color: #0f172a;
        }

        .v6-refresh-btn { background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 100px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .v6-refresh-btn.loading { opacity: 0.5; }
        .v6-refresh-btn:hover { background: #2563eb; transform: translateY(-1px); }

        .v6-user-menu { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 5px 15px; border-radius: 12px; transition: background 0.3s; }
        .v6-user-menu:hover { background: rgba(255, 255, 255, 0.05); }
        .v6-user-info { text-align: right; }
        .v6-user-name { display: block; font-weight: 700; font-size: 14px; }
        .v6-user-role { font-size: 11px; color: #94a3b8; }
        .v6-user-avatar { width: 36px; height: 36px; background: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); }

        /* Grid Layout */
        .v6-content-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 40px;
          padding: 40px;
        }

        .v6-sidebar { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 120px; height: fit-content; }

        /* Sidebar Cards */
        .v6-stats-card, .v6-alerts-card, .v6-info-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 24px;
        }

        .v6-section-title { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .v6-stat-list { display: flex; flex-direction: column; gap: 15px; }
        .v6-stat-item { display: flex; justify-content: space-between; align-items: center; }
        .v6-stat-label { color: #cbd5e1; font-size: 14px; }
        .v6-stat-val { font-weight: 800; font-size: 18px; }
        .v6-stat-val.highlight { color: #3b82f6; }
        .v6-stat-val.warning { color: #f59e0b; }
        .v6-stat-val.success { color: #10b981; }

        .v6-alerts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .v6-alerts-header h3 { font-size: 14px; font-weight: 700; color: #f87171; }
        .v6-alerts-header button { background: none; border: none; color: #64748b; font-size: 11px; cursor: pointer; }
        .v6-alert-item { padding: 12px; background: rgba(248, 113, 113, 0.05); border-radius: 12px; border-left: 3px solid #f87171; margin-bottom: 10px; }
        .v6-alert-item p { font-size: 13px; line-height: 1.4; margin-bottom: 4px; }
        .v6-alert-item small { font-size: 10px; color: #64748b; }

        .v6-info-card h4 { font-size: 13px; color: #ffffff; margin-bottom: 8px; }
        .v6-info-card p { font-size: 12px; color: #94a3b8; line-height: 1.6; }

        /* Main Feed */
        .v6-feed-header { margin-bottom: 30px; }
        .v6-feed-title h2 { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px; }
        .v6-feed-title p { color: #64748b; font-size: 16px; }

        .v6-ticket-list { display: flex; flex-direction: column; gap: 20px; }

        /* Ticket Card */
        .v6-ticket-card {
          background: #ffffff;
          color: #0f172a;
          border-radius: 28px;
          padding: 30px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }

        .v6-ticket-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }

        .v6-ticket-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .v6-ticket-id { font-family: monospace; color: #94a3b8; font-weight: 700; font-size: 14px; }
        .v6-prio-tag { font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; border-radius: 100px; }
        .v6-prio-tag.prio-urgent { background: #fee2e2; color: #ef4444; }
        .v6-prio-tag.prio-high { background: #ffedd5; color: #f59e0b; }
        .v6-prio-tag.prio-medium { background: #e0f2fe; color: #0ea5e9; }
        .v6-ticket-status { margin-left: auto; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

        .v6-ticket-title { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
        .v6-ticket-desc { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px; }

        .v6-ticket-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #f8fafc; padding: 20px; border-radius: 20px; }
        .v6-meta-item label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
        .v6-meta-item span { font-weight: 700; font-size: 14px; color: #1e3a8a; }
        .v6-meta-item span.assigned { color: #10b981; }
        .v6-meta-item span.available { color: #f59e0b; }

        .v6-ticket-actions { margin-top: 25px; display: flex; gap: 12px; }
        .v6-action-btn { flex: 1; padding: 14px; border-radius: 16px; border: none; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.3s; }
        .v6-action-btn.primary { background: #1e293b; color: white; }
        .v6-action-btn.success { background: #10b981; color: white; }
        .v6-action-btn.danger { background: #ef4444; color: white; }
        .v6-action-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

        .v6-ticket-footer { margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 20px; }

        /* Analytics View Styles */
        .v6-analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .v6-chart-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; padding: 30px; }
        .v6-chart-card.full-width { grid-column: span 2; }
        .v6-chart-card h3 { font-size: 18px; font-weight: 800; margin-bottom: 25px; color: #ffffff; }

        .v6-bar-chart { display: flex; flex-direction: column; gap: 20px; }
        .v6-bar-row { display: flex; flex-direction: column; gap: 8px; }
        .v6-bar-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
        .v6-bar-bg { height: 10px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .v6-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 10px; transition: width 1s ease-out; }

        .v6-priority-rings { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
        .v6-prio-stat { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .v6-ring {
            width: 80px; height: 80px; border-radius: 50%;
            background: conic-gradient(#3b82f6 calc(var(--pct) * 1%), rgba(255,255,255,0.05) 0);
            display: flex; align-items: center; justify-content: center; position: relative;
        }
        .v6-ring::after { content: ''; position: absolute; width: 60px; height: 60px; background: #0f172a; border-radius: 50%; }
        .v6-ring.urgent { background: conic-gradient(#ef4444 calc(var(--pct) * 1%), rgba(255,255,255,0.05) 0); }
        .v6-ring.high { background: conic-gradient(#f59e0b calc(var(--pct) * 1%), rgba(255,255,255,0.05) 0); }
        .v6-ring.medium { background: conic-gradient(#0ea5e9 calc(var(--pct) * 1%), rgba(255,255,255,0.05) 0); }
        
        .v6-ring-val { position: relative; z-index: 1; font-weight: 800; font-size: 14px; }
        .v6-prio-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

        .v6-efficiency-box { display: flex; align-items: center; gap: 40px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 40px; border-radius: 24px; border: 1px solid rgba(59, 130, 246, 0.1); }
        .v6-eff-main { display: flex; flex-direction: column; align-items: center; }
        .v6-eff-val { font-size: 48px; font-weight: 900; color: #3b82f6; }
        .v6-eff-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .v6-eff-details p { font-size: 16px; color: #cbd5e1; line-height: 1.6; }
        .v6-eff-details strong { color: #ffffff; }

        /* Skeleton */
        .v6-skeleton-ticket { height: 350px; background: rgba(255, 255, 255, 0.03); border-radius: 28px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }

        /* Modal */
        .v6-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .v6-modal { background: white; color: #0f172a; padding: 40px; border-radius: 32px; width: 400px; text-align: center; }
        .v6-modal h3 { font-size: 24px; font-weight: 800; margin-bottom: 15px; }
        .v6-modal p { color: #475569; margin-bottom: 30px; line-height: 1.5; white-space: pre-wrap; }
        .v6-modal-btns { display: flex; gap: 15px; }
        .v6-confirm { flex: 1; background: #1e293b; color: white; border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; }
        .v6-cancel { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; }

        .animate-in { animation: v6FadeIn 0.6s ease forwards; opacity: 0; }
        @keyframes v6FadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1100px) {
          .v6-content-grid { grid-template-columns: 1fr; }
          .v6-sidebar { position: relative; top: 0; order: 2; }
          .v6-main-feed { order: 1; }
          .v6-analytics-grid { grid-template-columns: 1fr; }
          .v6-priority-rings { grid-template-columns: 1fr 1fr; }
          .v6-efficiency-box { flex-direction: column; text-align: center; }
        }
      `}</style>
    </main>
  );
}