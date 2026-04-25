import {
  formatNotificationTimestamp,
  getNotificationIcon,
} from "./notificationUtils";

export default function NotificationPanel({
  title = "Notification Center",
  kicker = "Updates",
  notifications = [],
  emptyText = "No notifications yet.",
  onMarkAllRead,
  onClearAll,
}) {
  return (
    <article className="glass-panel notification-center-panel animate-fade-in">
      <div className="panel-header-actions notification-center-header">
        <div>
          <span className="panel-kicker">{kicker}</span>
          <h2>{title}</h2>
        </div>
        <div className="notification-center-actions">
          {onMarkAllRead && (
            <button type="button" className="tiny-btn" onClick={onMarkAllRead}>
              Mark all read
            </button>
          )}
          {onClearAll && (
            <button type="button" className="tiny-btn" onClick={onClearAll}>
              Clear
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="empty">{emptyText}</p>
      ) : (
        <ul className="notification-center-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-center-item ${
                notification.read ? "read" : "unread"
              }`}
            >
              <div className="notification-center-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-center-copy">
                <strong>{notification.title || notification.message}</strong>
                {notification.title && notification.title !== notification.message && (
                  <p>{notification.message}</p>
                )}
                {!notification.title && <p>{notification.message}</p>}
                <small>{formatNotificationTimestamp(notification.timestamp)}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
