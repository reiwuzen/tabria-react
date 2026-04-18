import type { ReactNode } from "react";
import "./accessibilityBar.css";

type AccessibilityBarProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  url: string;
  trailingControl?: ReactNode;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
};

const AccessibilityBar = ({
  canGoBack,
  canGoForward,
  url,
  trailingControl,
  onBack,
  onForward,
  onReload,
}: AccessibilityBarProps) => {
  const displayUrl = url === "about:blank" ? "" : url;
  const urlPlaceholder = url === "about:blank" ? "Search or enter address" : "Current page URL";

  return (
    <section className="accessibility-bar" aria-label="Navigation controls">
      <div className="accessibility-bar__controls">
        <button
          className="accessibility-bar__button accessibility-bar__button--icon-only"
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Go back"
        >
          <span aria-hidden="true">◀</span>
        </button>
        <button
          className="accessibility-bar__button accessibility-bar__button--icon-only"
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Go forward"
        >
          <span aria-hidden="true">▶</span>
        </button>
        <button
          className="accessibility-bar__button accessibility-bar__button--icon-only"
          type="button"
          onClick={onReload}
          aria-label="Reload"
        >
          <span aria-hidden="true">↻</span>
        </button>
      </div>
      <input
        className="accessibility-bar__url"
        type="text"
        value={displayUrl}
        placeholder={urlPlaceholder}
        readOnly
        aria-label="Current URL"
      />
      {trailingControl ? <div className="accessibility-bar__trailing">{trailingControl}</div> : null}
    </section>
  );
};

export default AccessibilityBar;
