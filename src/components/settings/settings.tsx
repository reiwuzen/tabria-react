import { useMemo, useState } from "react";
import type { Workspace } from "@reiwuzen/tabria";
import "./settings.css";

type SettingsProps = {
  limits: Workspace["limits"];
  openTabCount: number;
  closedTabCount: number;
  tabbarTheme: "system" | "graphite" | "ocean";
  onTabbarThemeChange: (theme: "system" | "graphite" | "ocean") => void;
  onLimitsChange: (limits: { openTabs: number; closedTabs: number }) => void;
};

type SettingsSectionId = "you-and-tabria" | "tabs" | "appearance" | "privacy" | "system";

type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
};

const MIN_LIMIT = 10;
const MAX_LIMIT = 50;
const RECOMMENDED_LIMIT = 20;

const SECTIONS: SettingsSection[] = [
  {
    id: "you-and-tabria",
    label: "You and Tabria",
    description: "Workspace profile and defaults",
  },
  {
    id: "tabs",
    label: "Tabs",
    description: "Open and recently closed tab limits",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and visual preferences",
  },
  {
    id: "privacy",
    label: "Privacy and security",
    description: "Permissions and data retention",
  },
  {
    id: "system",
    label: "System",
    description: "Platform integration and behavior",
  },
];

const clampLimit = (value: number) => {
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value));
};

const Settings = ({
  limits,
  openTabCount,
  closedTabCount,
  tabbarTheme,
  onTabbarThemeChange,
  onLimitsChange,
}: SettingsProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("tabs");
  const [openTabsLimit, setOpenTabsLimit] = useState(String(limits.openTabs));
  const [closedTabsLimit, setClosedTabsLimit] = useState(String(limits.closedTabs));
  const [prevLimits, setPrevLimits] = useState(limits);

  if (limits.openTabs !== prevLimits.openTabs || limits.closedTabs !== prevLimits.closedTabs) {
    setPrevLimits(limits);
    setOpenTabsLimit(String(limits.openTabs));
    setClosedTabsLimit(String(limits.closedTabs));
  }

  const activeSectionMeta = useMemo(() => {
    return SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[1];
  }, [activeSection]);

  const handleSave = () => {
    const nextOpenTabsLimit = clampLimit(Number(openTabsLimit) || RECOMMENDED_LIMIT);
    const nextClosedTabsLimit = clampLimit(Number(closedTabsLimit) || RECOMMENDED_LIMIT);

    setOpenTabsLimit(String(nextOpenTabsLimit));
    setClosedTabsLimit(String(nextClosedTabsLimit));
    onLimitsChange({
      openTabs: nextOpenTabsLimit,
      closedTabs: nextClosedTabsLimit,
    });
  };

  const handleRecommended = () => {
    const recommended = String(RECOMMENDED_LIMIT);
    setOpenTabsLimit(recommended);
    setClosedTabsLimit(recommended);
    onLimitsChange({
      openTabs: RECOMMENDED_LIMIT,
      closedTabs: RECOMMENDED_LIMIT,
    });
  };

  const renderPanel = () => {
    if (activeSection === "appearance") {
      return (
        <>
          <div className="settings__header">
            <div>
              <h2 className="settings__panel-title">Appearance</h2>
              <p className="settings__panel-copy">
                Adjust visual treatment for the tab strip only. The rest of the interface remains unchanged.
              </p>
            </div>
          </div>

          <div className="settings__group">
            <div className="settings__group-header">
              <h3 className="settings__group-title">Tabbar theme</h3>
              <p className="settings__group-copy">
                Pick a professional preset for the browser tab strip.
              </p>
            </div>

            <div className="settings__theme-list">
              <button
                className={`settings__theme-card${tabbarTheme === "system" ? " settings__theme-card--active" : ""}`}
                type="button"
                onClick={() => onTabbarThemeChange("system")}
              >
                <span className="settings__theme-name">System</span>
                <span className="settings__theme-copy">Matches the current app palette.</span>
              </button>
              <button
                className={`settings__theme-card${tabbarTheme === "graphite" ? " settings__theme-card--active" : ""}`}
                type="button"
                onClick={() => onTabbarThemeChange("graphite")}
              >
                <span className="settings__theme-name">Graphite</span>
                <span className="settings__theme-copy">Neutral chrome with a sharper desktop feel.</span>
              </button>
              <button
                className={`settings__theme-card${tabbarTheme === "ocean" ? " settings__theme-card--active" : ""}`}
                type="button"
                onClick={() => onTabbarThemeChange("ocean")}
              >
                <span className="settings__theme-name">Ocean</span>
                <span className="settings__theme-copy">Cool blue accenting focused on navigation.</span>
              </button>
            </div>
          </div>
        </>
      );
    }

    if (activeSection !== "tabs") {
      return (
        <div className="settings__placeholder">
          <h2 className="settings__panel-title">{activeSectionMeta.label}</h2>
          <p className="settings__panel-copy">
            This section is scaffolded into the settings shell, but only the Tabs section has
            interactive controls right now.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="settings__header">
          <div>
            <h2 className="settings__panel-title">Tabs</h2>
            <p className="settings__panel-copy">
              Control how many open and recently closed tabs the workspace keeps. Recommended is
              {" "}
              <strong>{RECOMMENDED_LIMIT}</strong>
              {" "}
              for both.
            </p>
          </div>
        </div>

        <div className="settings__stats" aria-label="Current workspace usage">
          <div className="settings__stat">
            <span className="settings__stat-label">Open tabs now</span>
            <strong className="settings__stat-value">{openTabCount}</strong>
          </div>
          <div className="settings__stat">
            <span className="settings__stat-label">Recently closed now</span>
            <strong className="settings__stat-value">{closedTabCount}</strong>
          </div>
          <div className="settings__stat">
            <span className="settings__stat-label">Total cap</span>
            <strong className="settings__stat-value">{limits.totalTabs}</strong>
          </div>
        </div>

        <div className="settings__group">
          <div className="settings__group-header">
            <h3 className="settings__group-title">Tab retention</h3>
            <p className="settings__group-copy">
              Each value must stay between 10 and 50. The package recommendation is 20.
            </p>
          </div>

          <div className="settings__rows">
            <label className="settings__row">
              <div className="settings__row-copy">
                <span className="settings__row-title">Open tabs limit</span>
                <span className="settings__row-hint">
                  How many active tabs the workspace may keep at once.
                </span>
              </div>
              <input
                className="settings__input"
                type="number"
                inputMode="numeric"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                value={openTabsLimit}
                onChange={(event) => setOpenTabsLimit(event.target.value)}
              />
            </label>

            <label className="settings__row">
              <div className="settings__row-copy">
                <span className="settings__row-title">Recently closed limit</span>
                <span className="settings__row-hint">
                  How many closed tabs remain available for restore.
                </span>
              </div>
              <input
                className="settings__input"
                type="number"
                inputMode="numeric"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                value={closedTabsLimit}
                onChange={(event) => setClosedTabsLimit(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="settings__actions">
          <button className="settings__button settings__button--secondary" type="button" onClick={handleRecommended}>
            Use Recommended
          </button>
          <button className="settings__button" type="button" onClick={handleSave}>
            Save Limits
          </button>
        </div>
      </>
    );
  };

  return (
    <section className="settings" aria-label="Settings">
      <div className="settings__shell">
        <aside className="settings__nav" aria-label="Settings sections">
          <nav className="settings__nav-list">
            {SECTIONS.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  className={`settings__nav-item${isActive ? " settings__nav-item--active" : ""}`}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="settings__nav-label">{section.label}</span>
                  <span className="settings__nav-description">{section.description}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="settings__content">
          {renderPanel()}
        </div>
      </div>
    </section>
  );
};

export default Settings;
