import { useApp } from "../context/AppContext";
import { Icon, type IconName } from "./Icon";

const STYLES: Record<string, { icon: IconName; cls: string }> = {
  success: { icon: "check", cls: "toast-success" },
  info: { icon: "info", cls: "toast-info" },
  error: { icon: "close", cls: "toast-error" },
};

export function Toasts() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="toasts" role="region" aria-label="การแจ้งเตือน">
      {toasts.map((t) => {
        const s = STYLES[t.type] ?? STYLES.success;
        return (
          <button
            key={t.id}
            className={`toast ${s.cls}`}
            onClick={() => dismissToast(t.id)}
            style={{ animation: "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
            aria-live="polite"
          >
            <span className="toast-icon">
              <Icon name={s.icon} size={15} strokeWidth={2.4} />
            </span>
            <span className="toast-msg">{t.message}</span>
            <span className="toast-x">
              <Icon name="close" size={14} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
