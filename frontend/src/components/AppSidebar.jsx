import { useNavigate } from "react-router-dom";

const menuItems = [
    { label: "Dashboard", path: "/", icon: "▣", key: "dashboard" },
    { label: "Transactions", path: "/transactions", icon: "▤", key: "transactions" },
    { label: "Reports", path: "/reports", icon: "▧", key: "reports" },
    { label: "Analytics", path: "/analytics", icon: "⌁", key: "analytics" },
    { label: "Settings", path: "/settings", icon: "⚙", key: "settings" },
];

function AppSidebar({ active }) {
    const navigate = useNavigate();

    return (
        <aside className="sidebar glass">
            <div>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">📊</div>

                    <div>
                        <h2>CashFlow</h2>
                        <p>Finance App</p>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={
                                active === item.key ? "sidebar-item active" : "sidebar-item"
                            }
                            onClick={() => navigate(item.path)}
                            type="button"
                        >
                            <span className="sidebar-item-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

export default AppSidebar;