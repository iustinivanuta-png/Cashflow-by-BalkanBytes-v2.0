import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../useLanguage";

function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { t } = useLanguage();

    const menuItems = [
        {
            label: t.dashboard,
            path: "/",
            icon: "▰",
            key: "dashboard",
        },
        {
            label: t.transactions,
            path: "/transactions",
            icon: "≡",
            key: "transactions",
        },

        {
            label: "Savings",
            path: "/savings",
            icon: "💰",
            key: "savings",
        },
        
        {
            label: t.analytics,
            path: "/analytics",
            icon: "▥",
            key: "analytics",
        },
        {
            label: t.settings,
            path: "/settings",
            icon: "⚙",
            key: "settings",
        },
    ];

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <aside className="cf-sidebar">
            <div>
                <button
                    className="cf-sidebar-brand"
                    type="button"
                    onClick={() => navigate("/")}
                >
                    <div className="cf-sidebar-mark">
                        C
                    </div>

                    <span>CashFlow</span>
                </button>

                <nav className="cf-sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={
                                isActive(item.path)
                                    ? "cf-sidebar-item active"
                                    : "cf-sidebar-item"
                            }
                            onClick={() =>
                                navigate(item.path)
                            }
                        >
                            <span className="cf-sidebar-icon">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="cf-sidebar-app-card">
                <div>
                    <strong>
                        {t.downloadApp ||
                            "Download our app"}
                    </strong>

                    <p>
                        {t.manageFinances ||
                            "Manage your finances on the go"}
                    </p>
                </div>

                <div className="cf-phone-preview">
                    ▣
                </div>

                <div className="cf-store-row">
                    <button type="button">
                         App Store
                    </button>

                    <button type="button">
                        ▶ Google Play
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default AppSidebar;