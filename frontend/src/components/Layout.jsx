import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <TopBar />

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}