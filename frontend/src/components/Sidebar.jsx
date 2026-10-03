import {
  Activity,
  AlertTriangle,
  Bot,
  Cpu,
  FileText,
  Gauge,
  Map,
  Radio,
  Route,
  Shield,
  Target,
  Users,
  Wifi,
  Zap
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "OPERATIONS",
    items: [
      {
        name: "Overview",
        path: "/overview",
        icon: Gauge
      },
      {
        name: "Live Detection",
        path: "/live-detection",
        icon: Radio
      },
      {
        name: "Victims",
        path: "/victims",
        icon: Users
      },
      {
        name: "Hazards",
        path: "/hazards",
        icon: AlertTriangle
      },
      {
        name: "Drones",
        path: "/drones",
        icon: Target
      }
    ]
  },
  {
    title: "MISSION CONTROL",
    items: [
      {
        name: "Routes",
        path: "/routes",
        icon: Route
      },
      {
        name: "Coverage",
        path: "/coverage",
        icon: Map
      },
      {
        name: "RESQ AI",
        path: "/resq-ai",
        icon: Bot
      },
      {
        name: "Simulation",
        path: "/simulation",
        icon: Activity
      }
    ]
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "Reports",
        path: "/reports",
        icon: FileText
      },
      {
        name: "System Health",
        path: "/system-health",
        icon: Cpu
      }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-icon">
          <Shield size={25} />
        </div>

        <div>
          <div className="brand-name">
            RESQ<span>-OPS</span>
          </div>

          <div className="brand-subtitle">
            EMERGENCY COMMAND
          </div>
        </div>
      </div>

      <div className="system-status">
        <span className="status-dot"></span>
        SYSTEM OPERATIONAL
      </div>

      <nav>
        {menu.map((section) => (
          <div className="nav-section" key={section.title}>

            <div className="nav-heading">
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="secure-line">
          <Wifi size={14} />
          SECURE NETWORK
        </div>

        <div className="version">
          RESQ-OPS v1.0
        </div>
      </div>

    </aside>
  );
}