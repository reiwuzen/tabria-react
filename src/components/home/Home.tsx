import { useState, useEffect, useRef, useCallback } from "react";
import type { Tab } from "@reiwuzen/tabria";
import "./Home.css";

type HomeProps = {
  openTabCount: number;
  closedTabCount: number;
  recentlyClosedTabs: Tab[];
  onReopenTab: (tabId: string) => void;
  onNewTab: () => void;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getTimeEmoji = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "🌙";
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌆";
};

const SHORTCUTS = [
  { keys: ["Ctrl", "T"], label: "New Tab" },
  { keys: ["Ctrl", "W"], label: "Close Tab" },
  { keys: ["Ctrl", "Tab"], label: "Next Tab" },
  { keys: ["Ctrl", "1-9"], label: "Switch to Tab" },
];

const QUICK_LINKS = [
  { icon: "🔍", label: "Google", url: "https://google.com" },
  { icon: "💻", label: "GitHub", url: "https://github.com" },
  { icon: "📺", label: "YouTube", url: "https://youtube.com" },
  { icon: "📰", label: "Reddit", url: "https://reddit.com" },
  { icon: "🎵", label: "Spotify", url: "https://open.spotify.com" },
  { icon: "📝", label: "Notion", url: "https://notion.so" },
];

const Home = ({
  openTabCount,
  closedTabCount,
  recentlyClosedTabs,
  onReopenTab,
  onNewTab,
}: HomeProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight) {
      setThumbHeight(0);
      return;
    }
    const trackHeight = clientHeight - 8;
    const ratio = clientHeight / scrollHeight;
    const height = Math.max(ratio * trackHeight, 30);
    const maxTop = trackHeight - height;
    const top = (scrollTop / (scrollHeight - clientHeight)) * maxTop;
    setThumbHeight(height);
    setThumbTop(top + 4);
  }, []);

  const showScrollbar = useCallback(() => {
    clearTimeout(hideTimer.current);
    setScrollbarVisible(true);
    updateThumb();
  }, [updateThumb]);

  const scheduleHide = useCallback(() => {
    if (isDragging) return;
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setScrollbarVisible(false), 1200);
  }, [isDragging]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      showScrollbar();
      scheduleHide();
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    // Defer initial calculation to avoid synchronous setState in effect
    const rafId = requestAnimationFrame(() => updateThumb());

    const ro = new ResizeObserver(() => updateThumb());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      clearTimeout(hideTimer.current);
    };
  }, [showScrollbar, scheduleHide, updateThumb]);

  // Drag-to-scroll on the thumb
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const { scrollHeight, clientHeight } = el;
      const trackHeight = clientHeight - 8;
      const ratio = clientHeight / scrollHeight;
      const tHeight = Math.max(ratio * trackHeight, 30);
      const maxTop = trackHeight - tHeight;
      const delta = e.clientY - dragStartY.current;
      const scrollRatio = delta / maxTop;
      el.scrollTop = dragStartScrollTop.current + scrollRatio * (scrollHeight - clientHeight);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      scheduleHide();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, scheduleHide]);

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = scrollRef.current?.scrollTop ?? 0;
  };

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="home"
      onMouseEnter={() => { showScrollbar(); scheduleHide(); }}
      onMouseLeave={scheduleHide}
    >
      <div className="home__scroll" ref={scrollRef}>
        {/* ── Hero Section ── */}
        <header className="home__hero">
          <div className="home__hero-glow" />
          <span className="home__emoji">{getTimeEmoji()}</span>
          <h1 className="home__greeting">{getGreeting()}</h1>
          <p className="home__subtitle">Where would you like to go?</p>
          <div className="home__clock">
            <span className="home__time">{formattedTime}</span>
            <span className="home__date">{formattedDate}</span>
          </div>
        </header>

        {/* ── Dashboard Grid ── */}
        <div className="home__grid">
          {/* Stats Card */}
          <section className="home__card home__card--stats" id="workspace-stats">
            <div className="home__card-header">
              <span className="home__card-icon">📊</span>
              <h2 className="home__card-title">Workspace</h2>
            </div>
            <div className="home__stats">
              <div className="home__stat">
                <span className="home__stat-value home__stat-value--primary">{openTabCount}</span>
                <span className="home__stat-label">Open Tabs</span>
                <div className="home__stat-bar">
                  <div
                    className="home__stat-bar-fill home__stat-bar-fill--primary"
                    style={{ width: `${Math.min(openTabCount * 5, 100)}%` }}
                  />
                </div>
              </div>
              <div className="home__stat">
                <span className="home__stat-value home__stat-value--accent">{closedTabCount}</span>
                <span className="home__stat-label">Recently Closed</span>
                <div className="home__stat-bar">
                  <div
                    className="home__stat-bar-fill home__stat-bar-fill--accent"
                    style={{ width: `${Math.min(closedTabCount * 5, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions Card */}
          <section className="home__card home__card--actions" id="quick-actions">
            <div className="home__card-header">
              <span className="home__card-icon">⚡</span>
              <h2 className="home__card-title">Quick Actions</h2>
            </div>
            <div className="home__action-grid">
              <button className="home__action-btn home__action-btn--primary" onClick={onNewTab} id="new-tab-action">
                <span className="home__action-emoji">✨</span>
                <span className="home__action-text">New Tab</span>
              </button>
              <button className="home__action-btn" onClick={onNewTab} id="incognito-action">
                <span className="home__action-emoji">🔒</span>
                <span className="home__action-text">Private</span>
              </button>
              <button className="home__action-btn" onClick={onNewTab} id="bookmark-action">
                <span className="home__action-emoji">📌</span>
                <span className="home__action-text">Bookmark</span>
              </button>
              <button className="home__action-btn" onClick={onNewTab} id="duplicate-action">
                <span className="home__action-emoji">📋</span>
                <span className="home__action-text">Duplicate</span>
              </button>
            </div>
          </section>

          {/* Quick Links */}
          <section className="home__card home__card--links" id="quick-links">
            <div className="home__card-header">
              <span className="home__card-icon">🔗</span>
              <h2 className="home__card-title">Quick Links</h2>
            </div>
            <div className="home__links-grid">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  className="home__link-tile"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="home__link-icon">{link.icon}</span>
                  <span className="home__link-label">{link.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="home__card home__card--shortcuts" id="keyboard-shortcuts">
            <div className="home__card-header">
              <span className="home__card-icon">⌨️</span>
              <h2 className="home__card-title">Shortcuts</h2>
            </div>
            <div className="home__shortcuts-list">
              {SHORTCUTS.map((shortcut) => (
                <div key={shortcut.label} className="home__shortcut">
                  <div className="home__shortcut-keys">
                    {shortcut.keys.map((key) => (
                      <kbd key={key} className="home__kbd">{key}</kbd>
                    ))}
                  </div>
                  <span className="home__shortcut-label">{shortcut.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recently Closed */}
          {recentlyClosedTabs.length > 0 && (
            <section className="home__card home__card--history" id="recently-closed">
              <div className="home__card-header">
                <span className="home__card-icon">🕐</span>
                <h2 className="home__card-title">Continue where you left off</h2>
              </div>
              <div className="home__history-list">
                {recentlyClosedTabs.slice(0, 5).map((tab) => (
                  <button
                    key={tab.id}
                    className="home__history-item"
                    onClick={() => onReopenTab(tab.id as string)}
                  >
                    <div className="home__history-icon">
                      {(tab.title || "T").charAt(0).toUpperCase()}
                    </div>
                    <div className="home__history-info">
                      <span className="home__history-name">{tab.title}</span>
                      <span className="home__history-url">
                        {tab.currentPageId ? tab.pages.storage[tab.currentPageId]?.url : "about:blank"}
                      </span>
                    </div>
                    <span className="home__history-arrow">→</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="home__footer">
          <div className="home__footer-brand">
            <span className="home__footer-logo">◆</span>
            <span>Tabria</span>
          </div>
          <span className="home__footer-divider">·</span>
          <span>Premium Tab Management</span>
        </footer>
      </div>

      {/* ── Custom Scrollbar ── */}
      {thumbHeight > 0 && (
        <div className={`home__scrollbar-track ${scrollbarVisible ? 'home__scrollbar-track--visible' : ''}`}>
          <div
            ref={thumbRef}
            className="home__scrollbar-thumb"
            style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
