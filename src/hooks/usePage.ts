import { actions, core, type Page, type TabID, type Workspace } from "@reiwuzen/tabria";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

type UsePageOptions = {
  workspace: Workspace;
  setWorkspace: Dispatch<SetStateAction<Workspace>>;
};

export const usePage = ({ workspace, setWorkspace }: UsePageOptions) => {
  const pushPage = useCallback((tabId: TabID, page: Page) => {
    setWorkspace((prev) => actions.pushScreen(prev, tabId, page));
  }, [setWorkspace]);

  const popPage = useCallback((tabId: TabID) => {
    setWorkspace((prev) => actions.popScreen(prev, tabId));
  }, [setWorkspace]);

  const replacePage = useCallback((tabId: TabID, page: Page) => {
    setWorkspace((prev) => actions.replaceScreen(prev, tabId, page));
  }, [setWorkspace]);

  const updatePageState = useCallback(
    (tabId: TabID, patch: Record<string, unknown>) => {
      setWorkspace((prev) => actions.updateScreenState(prev, tabId, patch));
    },
    [setWorkspace]
  );

  const createPage = useCallback((opts?: Parameters<typeof core.createScreen>[0]) => {
    return core.createScreen(opts);
  }, []);

  return {
    activeTabId: workspace.activeTab,
    createPage,
    pushPage,
    popPage,
    replacePage,
    updatePageState,
  };
};
