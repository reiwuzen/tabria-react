import type { Tab, TabID } from "@reiwuzen/tabria";
import "./tabbar.css";

type TabbarProps = {
  tabs: Tab[];
  activeTabId: TabID | null;
  onTabClick: (tabId: TabID) => void;
  onTabClose: (tabId: TabID) => void;
  onNewTab: () => void;
  canOpenTab?: boolean;
  theme?: "system" | "graphite" | "ocean";
};

const getTabUrl = (tab: Tab) => {
  const currentPageId = tab.currentPageId;
  return currentPageId ? tab.pages.storage[currentPageId]?.url ?? "about:blank" : "about:blank";
};

const getTabIcon = (url: string, title: string) => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return host.charAt(0).toUpperCase() || "G";
    } catch {
      return "G";
    }
  }

  if (url === "about:blank") {
    return "N";
  }

  return (title || "T").charAt(0).toUpperCase();
};

const Tabbar = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  canOpenTab = true,
  theme = "system",
}: TabbarProps) => {
  return (
    <div className={`tabbar tabbar--${theme}`}>
      <button
        className="tabbar__new"
        type="button"
        onClick={onNewTab}
        disabled={!canOpenTab}
        aria-label="Open new tab"
      >
        +
      </button>

      <div className="tabbar__scroller-shell">
        <div className="tabbar__scroller">
          <div className="tabbar__track" role="tablist" aria-label="Browser tabs">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const url = getTabUrl(tab);
              const icon = getTabIcon(url, tab.title);

              return (
                <button
                  key={tab.id}
                  className={`tabbar__tab${isActive ? " tabbar__tab--active" : ""}`}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabClick(tab.id)}
                  type="button"
                  title={url}
                >
                  <span className="tabbar__icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="tabbar__title">{tab.title || "New Tab"}</span>
                  <span
                    className="tabbar__close"
                    role="button"
                    aria-label={`Close ${tab.title || "tab"}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onTabClose(tab.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onTabClose(tab.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    ✕
                  
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabbar;
