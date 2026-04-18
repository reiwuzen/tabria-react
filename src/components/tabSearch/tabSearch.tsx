import { useEffect, useMemo, useRef, useState } from "react";
import type { Tab, TabID } from "@reiwuzen/tabria";
import "./tabSearch.css";

type TabSearchProps = {
  openTabs: Tab[];
  recentlyClosedTabs: Tab[];
  activeTabId: TabID | null;
  onOpenTabSelect: (tabId: TabID) => void;
  onOpenTabClose: (tabId: TabID) => void;
  onRecentlyClosedSelect: (tabId: TabID) => void;
};

const getTabUrl = (tab: Tab) => {
  const currentPageId = tab.currentPageId;
  return currentPageId
    ? (tab.pages.storage[currentPageId]?.url ?? "about:blank")
    : "about:blank";
};

const TabSearch = ({
  openTabs,
  recentlyClosedTabs,
  activeTabId,
  onOpenTabSelect,
  onOpenTabClose,
  onRecentlyClosedSelect,
}: TabSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredOpenTabs = useMemo(() => {
    return openTabs.filter((tab) => {
      const title = tab.title.toLowerCase();
      const url = getTabUrl(tab).toLowerCase();
      return (
        normalizedQuery === "" ||
        title.includes(normalizedQuery) ||
        url.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, openTabs]);

  const filteredRecentlyClosedTabs = useMemo(() => {
    return recentlyClosedTabs.filter((tab) => {
      const title = tab.title.toLowerCase();
      const url = getTabUrl(tab).toLowerCase();
      return (
        normalizedQuery === "" ||
        title.includes(normalizedQuery) ||
        url.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, recentlyClosedTabs]);

  return (
    <div className="tab-search" ref={rootRef}>
      <button
        className="tab-search__trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="tab-search__trigger_svg"
          viewBox="50 50 80 70"
        >
          {/* <!-- Top bar --> */}
          <rect
            x="50"
            y="50"
            width="80"
            height="10"
            rx="5"
            fill="currentColor"
          />

          {/* <!-- Right block --> */}
          <rect x="95" y="55" width="35" height="16" fill="currentColor" />

          {/* <!-- Left vertical --> */}
          <rect
            x="50"
            y="50"
            width="10"
            height="60"
            rx="5"
            fill="currentColor"
          />

          {/* <!-- Bottom bar --> */}
          <rect
            x="50"
            y="100"
            width="35"
            height="10"
            rx="5"
            fill="currentColor"
          />

          {/* <!-- Circle --> */}
          <circle
            cx="104"
            cy="92"
            r="18"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
          />

          {/* <!-- Diagonal --> */}
          <path
            d="m126 116-10-10"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      {isOpen ? (
        <div
          className="tab-search__dropdown"
          role="dialog"
          aria-label="Search tabs"
        >
          <input
            className="tab-search__input"
            type="search"
            placeholder="Search tabs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <div className="tab-search__results">
            <div className="tab-search__section">
              <div className="tab-search__heading">Open Tabs</div>
              {filteredOpenTabs.length > 0 ? (
                filteredOpenTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`tab-search__item-row${tab.id === activeTabId ? " tab-search__item-row--active" : ""}`}
                  >
                    <button
                      className="tab-search__item tab-search__item--embedded"
                      type="button"
                      onClick={() => {
                        onOpenTabSelect(tab.id);
                        setIsOpen(false);
                      }}
                    >
                      <span className="tab-search__title">{tab.title}</span>
                      <span className="tab-search__meta">{getTabUrl(tab)}</span>
                    </button>
                    <button
                      className="tab-search__remove"
                      type="button"
                      aria-label={`Close ${tab.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenTabClose(tab.id);
                      }}
                    >
                      x
                    </button>
                  </div>
                ))
              ) : (
                <div className="tab-search__empty">No open tabs found.</div>
              )}
            </div>
            <div className="tab-search__section">
              <div className="tab-search__heading">Recently Closed</div>
              {filteredRecentlyClosedTabs.length > 0 ? (
                filteredRecentlyClosedTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className="tab-search__item"
                    type="button"
                    onClick={() => {
                      onRecentlyClosedSelect(tab.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="tab-search__title">{tab.title}</span>
                    <span className="tab-search__meta">{getTabUrl(tab)}</span>
                  </button>
                ))
              ) : (
                <div className="tab-search__empty">
                  No recently closed tabs found.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TabSearch;
