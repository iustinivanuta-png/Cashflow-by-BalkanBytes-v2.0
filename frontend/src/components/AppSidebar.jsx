import { useNavigate } from "react-router-dom";

const menuItems = [
    { label: "Dashboard", path: "/", icon: "▰", key: "dashboard" },
    { label: "Transactions", path: "/transactions", icon: "≡", key: "transactions" },
    { label: "Reports", path: "/reports", icon: "▧", key: "reports" },
    { label: "Analytics", path: "/analytics", icon: "▥", key: "analytics" },
    { label: "Settings", path: "/settings", icon: "⚙", key: "settings" },
];

function AppSidebar({ active }) {
    const navigate = useNavigate();

    return (
        <aside className="cf-sidebar">
            <div>
                <button className="cf-sidebar-brand" type="button" onClick={() => navigate("/")}>
                    <div className="cf-sidebar-mark">C</div>
                    <span>CashFlow</span>
                </button>

                <nav className="cf-sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={active === item.key ? "cf-sidebar-item active" : "cf-sidebar-item"}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="cf-sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="cf-sidebar-app-card">
                <div>
                    <strong>Download our app</strong>
                    <p>Manage your finances on the go</p>
                </div>
                <div className="cf-phone-preview">▣</div>
                <div className="cf-store-row">
                    <button type="button"> App Store</button>
                    <button type="button">▶ Google Play</button>
                </div>
            </div>
        </aside>
    );
}

export default AppSidebar;
