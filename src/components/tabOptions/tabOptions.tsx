import { useEffect, useRef, useState } from "react";
import "./tabOptions.css";

type TabOptionsProps = {
  onNewTab: () => void;
  onClearRecentlyClosed: () => void;
  onSettingsOpen: () => void;
  canOpenTab?: boolean;
  canClearRecentlyClosed?: boolean;
};

const TabOptions = ({
  onNewTab,
  onClearRecentlyClosed,
  onSettingsOpen,
  canOpenTab = true,
  canClearRecentlyClosed = true,
}: TabOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => {
    setIsOpen(false);
    setIsHistoryExpanded(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  return (
    <div className="tab-options" ref={rootRef}>
      <button
        className="tab-options__trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More options"
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }

          setIsOpen(true);
        }}
      >
        <span />
        <span />
        <span />
      </button>
      {isOpen ? (
        <div className="tab-options__menu" role="menu" aria-label="Tab options">
          <div className="tab-options__section">
            <button
              className="tab-options__item"
              type="button"
              role="menuitem"
              disabled={!canOpenTab}
              onClick={() => {
                onNewTab();
                closeMenu();
              }}
            >
              New Tab
            </button>
          </div>
          <div className="tab-options__section">
            <button
              className="tab-options__item"
              type="button"
              role="menuitem"
              aria-expanded={isHistoryExpanded}
              onClick={() => setIsHistoryExpanded((prev) => !prev)}
            >
              <span>History</span>
              <span className={`tab-options__caret${isHistoryExpanded ? " tab-options__caret--expanded" : ""}`}>
                &gt;
              </span>
            </button>
            {isHistoryExpanded ? (
              <button
                className="tab-options__item tab-options__item--danger"
                type="button"
                role="menuitem"
                disabled={!canClearRecentlyClosed}
                onClick={() => {
                  onClearRecentlyClosed();
                  closeMenu();
                }}
              >
                Clear All Recent Tabs
              </button>
            ) : null}
          </div>
          <div className="tab-options__section">
            <button
              className="tab-options__item"
              type="button"
              role="menuitem"
              onClick={() => {
                onSettingsOpen();
                closeMenu();
              }}
            >
              Settings
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TabOptions;
