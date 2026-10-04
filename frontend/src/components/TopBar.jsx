import {
  Bell,
  Radio,
  ShieldCheck
} from "lucide-react";

export default function TopBar() {
  return (
    <header className="topbar">

      <div>
        <div className="topbar-title">
          RESQ-OPS COMMAND CENTER
        </div>

        <div className="topbar-subtitle">
          AI-ASSISTED EMERGENCY RESPONSE & OPERATIONS
        </div>
      </div>

      <div className="topbar-actions">

        <div className="live-indicator">
          <span></span>
          LIVE
        </div>

        <button className="icon-button">
          <Bell size={19} />
        </button>

      </div>

    </header>
  );
}
