interface Props {
  text: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function UndoToast({ text, onUndo, onDismiss }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 8px 11px 16px",
        borderRadius: 14,
        background: "oklch(17% 0.025 220)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)",
        animation: "flSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        minWidth: 240,
        maxWidth: "calc(100vw - 48px)",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.72)",
          fontFamily: "var(--font-sans)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        Removed &ldquo;{text}&rdquo;
      </span>

      <button
        onClick={onUndo}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#22d3ee",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          padding: "5px 10px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Undo
      </button>

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.32)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 8px",
          borderRadius: 8,
          flexShrink: 0,
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
          <path
            d="M1 1 8 8M8 1 1 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
