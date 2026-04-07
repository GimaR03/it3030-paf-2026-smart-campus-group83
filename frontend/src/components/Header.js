import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onBack = null, title = 'Smart Campus Lecture Halls Booking' }) => {
  const { darkMode, toggleTheme } = useTheme();

  const styles = {
    header: {
      height: '64px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
      backgroundColor: darkMode ? '#111827' : '#ffffff',
      borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    backButton: {
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? 'transparent' : 'transparent',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    backButtonHover: {
      backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
      color: darkMode ? '#ffffff' : '#111827',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      margin: 0,
      color: darkMode ? '#ffffff' : '#111827',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginRight: '1rem',
    },
    navLink: {
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      padding: '0.5rem 0.25rem',
      borderBottom: '2px solid transparent',
      cursor: 'pointer',
      color: '#dc2626', // Red color for nav links
    },
    navLinkHover: {
      color: '#b91c1c', // Darker red on hover
      borderBottomColor: '#dc2626',
      transform: 'translateY(-1px)',
    },
    themeButton: {
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
      color: darkMode ? '#fbbf24' : '#374151',
    },
    themeButtonHover: {
      backgroundColor: darkMode ? '#374151' : '#e5e7eb',
      transform: 'scale(1.05)',
    },
  };

  const [isBackHovered, setIsBackHovered] = React.useState(false);
  const [isThemeHovered, setIsThemeHovered] = React.useState(false);
  const [hoveredLink, setHoveredLink] = React.useState(null);

  const navLinks = [
    { id: 1, name: 'Dashboard', href: '#' },
    { id: 2, name: 'Lecture Halls', href: '#' },
    { id: 3, name: 'My Bookings', href: '#' },
    { id: 4, name: 'Schedule', href: '#' },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Left Section - Back Button and Title */}
        <div style={styles.leftSection}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                ...styles.backButton,
                ...(isBackHovered ? styles.backButtonHover : {}),
              }}
              onMouseEnter={() => setIsBackHovered(true)}
              onMouseLeave={() => setIsBackHovered(false)}
              aria-label="Go back"
              title="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          
          <h1 style={styles.title}>
            {title}
          </h1>
        </div>

        {/* Navigation Bar - Lines 140, 158, 176, 194 with red color */}
        <nav style={styles.nav}>
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              style={{
                ...styles.navLink,
                ...(hoveredLink === link.id ? styles.navLinkHover : {}),
              }}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            ...styles.themeButton,
            ...(isThemeHovered ? styles.themeButtonHover : {}),
          }}
          onMouseEnter={() => setIsThemeHovered(true)}
          onMouseLeave={() => setIsThemeHovered(false)}
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            // Sun icon for light mode
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;