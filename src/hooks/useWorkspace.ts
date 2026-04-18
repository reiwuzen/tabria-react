import { core, type Workspace } from "@reiwuzen/tabria";
import { useCallback, useState } from "react";

type UseWorkspaceOptions = {
  initialWorkspace?: Workspace;
};

const isWorkspace = (
  value: Workspace | Parameters<typeof core.createWorkspace>[0]
): value is Workspace => {
  return value !== null && value !== undefined && "tabs" in value && "limits" in value;
};

export const useWorkspace = (options: UseWorkspaceOptions = {}) => {
  const [workspace, setWorkspace] = useState<Workspace>(
    options.initialWorkspace ?? core.createWorkspace()
  );

  const createWorkspace = useCallback((opts?: Parameters<typeof core.createWorkspace>[0]) => {
    return core.createWorkspace(opts);
  }, []);

  const resetWorkspace = useCallback((next?: Workspace | Parameters<typeof core.createWorkspace>[0]) => {
    if (!next) {
      setWorkspace(core.createWorkspace());
      return;
    }

    if (isWorkspace(next)) {
      setWorkspace(next);
      return;
    }

    setWorkspace(core.createWorkspace(next));
  }, []);

  const updateLimits = useCallback(
    (limitsPatch: Partial<Workspace["limits"]>) => {
      setWorkspace((prev) => ({
        ...prev,
        limits: {
          ...prev.limits,
          ...limitsPatch,
        },
      }));
    },
    []
  );

  return {
    workspace,
    limits: workspace.limits,
    setWorkspace,
    createWorkspace,
    resetWorkspace,
    updateLimits,
  };
};
