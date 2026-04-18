import { actions, core, selectors, type Page, type Tab, type TabID, type Workspace } from "@reiwuzen/tabria";
import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

type UseTabsOptions = {
  workspace: Workspace;
  setWorkspace: Dispatch<SetStateAction<Workspace>>;
};

type ReopenClosedTab = {
  (): void;
  (tabId: TabID): void;
};

type OpenTabOptions = Parameters<typeof actions.openTab>[1];

export type ActiveTab = (Tab & { activePage: Page | null; pageStack: Page[] }) | null;

export const useTabs = ({ workspace, setWorkspace }: UseTabsOptions) => {
  const tabCounts = useMemo(() => {
    const openTabs = workspace.tabs.openOrder.length;
    const closedTabs = workspace.tabs.closedOrder.length;
    return {
      openTabs,
      closedTabs,
      totalTabs: openTabs + closedTabs,
    };
  }, [workspace]);

  const tabCapacity = useMemo(() => {
    const { limits } = workspace;
    const openTabsRemaining = limits.openTabs === null ? null : Math.max(limits.openTabs - tabCounts.openTabs, 0);
    const closedTabsRemaining = limits.closedTabs === null ? null : Math.max(limits.closedTabs - tabCounts.closedTabs, 0);
    const totalTabsRemaining = limits.totalTabs === null ? null : Math.max(limits.totalTabs - tabCounts.totalTabs, 0);

    return {
      openTabsRemaining,
      closedTabsRemaining,
      totalTabsRemaining,
      canOpenTab: openTabsRemaining === null || openTabsRemaining > 0,
      canReopenClosedTab:
        workspace.tabs.closedOrder.length > 0 &&
        (openTabsRemaining === null || openTabsRemaining > 0),
    };
  }, [tabCounts, workspace]);

  const activeTab = useMemo<ActiveTab>(() => {
    const tab = selectors.getActiveTab(workspace);

    if (!tab) {
      return null;
    }

    return {
      ...tab,
      activePage: selectors.getActiveScreen(workspace, tab.id) ?? null,
      pageStack: selectors.getScreenStack(workspace, tab.id),
    };
  }, [workspace]);

  const addTab = useCallback((tab: Tab) => {
    setWorkspace((prev) => actions.addTab(prev, tab));
  }, [setWorkspace]);

  const openTab = useCallback((opts?: OpenTabOptions) => {
    setWorkspace((prev) => actions.openTab(prev, opts));
  }, [setWorkspace]);

  const activateTab = useCallback((tabId: TabID) => {
    setWorkspace((prev) => actions.activateTab(prev, tabId));
  }, [setWorkspace]);

  const activatePage = useCallback((tabId: TabID, pageId: Page["id"]) => {
    setWorkspace((prev) => actions.activatePage(prev, tabId, pageId));
  }, [setWorkspace]);

  const closeTab = useCallback((tabId: TabID) => {
    setWorkspace((prev) => actions.closeTab(prev, tabId));
  }, [setWorkspace]);

  const moveTab = useCallback((tabId: TabID, toIndex: number) => {
    setWorkspace((prev) => actions.moveTab(prev, tabId, toIndex));
  }, [setWorkspace]);

  const pushPage = useCallback((tabId: TabID, page: Page) => {
    setWorkspace((prev) => actions.pushScreen(prev, tabId, page));
  }, [setWorkspace]);

  const reopenClosedTab: ReopenClosedTab = useCallback((tabId?: TabID) => {
    setWorkspace((prev) => {
      if (tabId === undefined) {
        return actions.reopenClosedTab(prev);
      }

      return actions.reopenClosedTab(prev, tabId);
    });
  }, [setWorkspace]) as ReopenClosedTab;

  const clearClosedTabs = useCallback(() => {
    setWorkspace((prev) => {
      if (prev.tabs.closedOrder.length === 0) {
        return prev;
      }

      const storage = { ...prev.tabs.storage };

      for (const tabId of prev.tabs.closedOrder) {
        delete storage[tabId];
      }

      return {
        ...prev,
        tabs: {
          ...prev.tabs,
          closedOrder: [],
          storage,
        },
      };
    });
  }, [setWorkspace]);

  const createTab = useCallback(()=>core.createTab(), []);

  return {
    tabs: selectors.getTabs(workspace),
    activeTabId: workspace.activeTab,
    limits: workspace.limits,
    tabCounts,
    tabCapacity,
    activeTab,
    createTab,
    addTab,
    openTab,
    activateTab,
    activatePage,
    closeTab,
    moveTab,
    pushPage,
    reopenClosedTab,
    clearClosedTabs,
  };
};
