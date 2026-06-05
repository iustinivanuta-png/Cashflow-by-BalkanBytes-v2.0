import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Topbar from "./Topbar";

function AppLayout() {
    return (
        <div className="v0-dashboard-page page-enter">
            <div className="v0-shell">
                <AppSidebar />

                <main className="v0-main">
                    <Topbar />
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;