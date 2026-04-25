import { type ReactNode, useCallback, useEffect, useState } from "react";
import type { Page, TabID } from "@reiwuzen/tabria";
import AccessibilityBar from "./components/accessibilityBar/accessibilityBar";
import Settings from "./components/settings/settings";
import TabOptions from "./components/tabOptions/tabOptions";
import TabSearch from "./components/tabSearch/tabSearch";
import Tabbar from "./components/tabbar/tabbar";
import Home from "./components/home/Home";
import { useTabs } from "./hooks/useTabs";
import { useWorkspace } from "./hooks/useWorkspace";
import "./App.css";

type BrowserPage = Page;

function App() {
  const [tabbarTheme, setTabbarTheme] = useState<"system" | "graphite" | "ocean">("system");
  const { workspace, setWorkspace, updateLimits } = useWorkspace();
  const {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    activateTab,
    activatePage,
    closeTab,
    reopenClosedTab,
    clearClosedTabs,
    tabCapacity,
  } = useTabs({
    workspace,
    setWorkspace,
  });

  useEffect(() => {
    if (tabs.length === 0 && tabCapacity.canOpenTab) {
      openTab({
        title: "New Tab",
        page: {
          id: `page-${Date.now()}` as Page["id"],
          type: "page",
          url: "about:blank",
        } as BrowserPage,
      });
    }
  }, [openTab, tabCapacity.canOpenTab, tabs.length]);

  const handleNewTab = useCallback(() => {
    if (!tabCapacity.canOpenTab) {
      return;
    }

    const count = tabs.length + 1;
    openTab({
      title: `Tab ${count}`,
      page: {
        id: `page-${Date.now()}` as Page["id"],
        type: "page",
        url: `https://tabria.local/tab-${count}`,
      } as BrowserPage,
    });
  }, [openTab, tabCapacity.canOpenTab, tabs.length]);

  const handleOpenSettings = useCallback(() => {
    if (!tabCapacity.canOpenTab) {
      return;
    }

    openTab({
      title: "Settings",
      page: {
        id: `page-${Date.now()}` as Page["id"],
        type: "page",
        url: "tabria.settings",
      } as BrowserPage,
    });
  }, [openTab, tabCapacity.canOpenTab]);

  const handleBack = () => {
    if (!activeTabId || !activeTab?.currentPageId) {
      return;
    }

    const currentIndex = activeTab.pageStack.findIndex((page) => page.id === activeTab.currentPageId);
    if (currentIndex <= 0) {
      return;
    }

    activatePage(activeTabId, activeTab.pageStack[currentIndex - 1].id);
  };

  const handleForward = () => {
    if (!activeTabId || !activeTab?.currentPageId) {
      return;
    }

    const currentIndex = activeTab.pageStack.findIndex((page) => page.id === activeTab.currentPageId);
    if (currentIndex < 0 || currentIndex >= activeTab.pageStack.length - 1) {
      return;
    }

    activatePage(activeTabId, activeTab.pageStack[currentIndex + 1].id);
  };

  const handleReload = () => {
    if (!activeTab?.activePage) {
      return;
    }
  };

  const currentUrl = activeTab?.activePage?.url ?? "about:blank";
  const currentPageIndex = activeTab?.currentPageId
    ? activeTab.pageStack.findIndex((page) => page.id === activeTab.currentPageId)
    : -1;
  const canGoBack = currentPageIndex > 0;
  const canGoForward = currentPageIndex >= 0 && currentPageIndex < (activeTab?.pageStack.length ?? 0) - 1;
  const recentlyClosedTabs = workspace.tabs.closedOrder
    .map((tabId) => workspace.tabs.storage[tabId])
    .filter((tab): tab is typeof tabs[number] => Boolean(tab));
  const activePageState = activeTab?.activePage?.state;
  const openTabCount = workspace.tabs.openOrder.length;
  const closedTabCount = workspace.tabs.closedOrder.length;

  const activePageContent = activeTab?.activePage?.url === "tabria.settings"
    ? (
        <Settings
          limits={workspace.limits}
          openTabCount={openTabCount}
          closedTabCount={closedTabCount}
          tabbarTheme={tabbarTheme}
          onTabbarThemeChange={setTabbarTheme}
          onLimitsChange={({ openTabs, closedTabs }) => {
            updateLimits({
              openTabs,
              closedTabs,
              totalTabs: openTabs + closedTabs,
            });
          }}
        />
      )
    : activeTab?.activePage?.url === "about:blank" || !activeTabId
    ? (
        <Home
          openTabCount={openTabCount}
          closedTabCount={closedTabCount}
          recentlyClosedTabs={recentlyClosedTabs}
          onReopenTab={(tabId) => reopenClosedTab(tabId as TabID)}
          onNewTab={handleNewTab}
        />
      )
    : (activePageState as ReactNode);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "t") {
        event.preventDefault();
        handleNewTab();
        return;
      }

      if (key === "w") {
        if (!activeTabId) {
          return;
        }

        event.preventDefault();
        closeTab(activeTabId);
        return;
      }

      if (key === "tab") {
        if (tabs.length === 0) {
          return;
        }

        event.preventDefault();
        const currentIndex = activeTabId ? tabs.findIndex((tab) => tab.id === activeTabId) : -1;
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % tabs.length : 0;
        activateTab(tabs[nextIndex].id);
        return;
      }

      if (/^[1-9]$/.test(key)) {
        const targetIndex = Number(key) - 1;
        if (targetIndex >= tabs.length) {
          return;
        }

        event.preventDefault();
        activateTab(tabs[targetIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabId, activateTab, closeTab, handleNewTab, tabs]);

  return (
    <main className={`app app--${tabbarTheme}`}>
      <div className="app__chrome">
        <Tabbar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={activateTab}
          onTabClose={closeTab}
          onNewTab={handleNewTab}
          canOpenTab={tabCapacity.canOpenTab}
          theme={tabbarTheme}
        />
        <AccessibilityBar
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          url={currentUrl}
          trailingControl={
            <>
              <TabSearch
                openTabs={tabs}
                recentlyClosedTabs={recentlyClosedTabs}
                activeTabId={activeTabId}
                onOpenTabSelect={activateTab}
                onOpenTabClose={closeTab}
                onRecentlyClosedSelect={(tabId) => reopenClosedTab(tabId)}
              />
              <TabOptions
                onNewTab={handleNewTab}
                onClearRecentlyClosed={clearClosedTabs}
                onSettingsOpen={handleOpenSettings}
                canOpenTab={tabCapacity.canOpenTab}
                canClearRecentlyClosed={workspace.tabs.closedOrder.length > 0}
              />
            </>
          }
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
        />
      </div>
      <div className="app__content">
        <div key={activeTabId ?? "empty"} className="app__content-view">
          {activePageContent}
        </div>
      </div>
    </main>
  );
}

export default App;
