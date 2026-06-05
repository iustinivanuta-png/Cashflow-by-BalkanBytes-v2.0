import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AddTransactionModal from "./AddTransactionModal";


import { useLanguage } from "../useLanguage";

function Topbar() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const { t } = useLanguage();

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "dark"
    );

    const [profileOpen, setProfileOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    const handleThemeToggle = () => {
        setTheme((prev) =>
            prev === "dark" ? "light" : "dark"
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/auth";
    };

    return (
        <>
            <header className="v0-header">
                <div className="v0-header-left">
                    <h1 className="v0-header-title">
                        {t.welcomeBack},{" "}
                        {user?.name || "User"} 👋
                    </h1>
                </div>

                <div className="v0-header-actions">
                    <button
                        className="v0-add-button"
                        type="button"
                        onClick={() => setAddModalOpen(true)}
                    >
                        + {t.addTransaction}
                    </button>

                    
                    

                    <button
                        className="v0-theme-toggle"
                        type="button"
                        onClick={handleThemeToggle}
                    >
                        {theme === "dark" ? "🌙" : "☀️"}
                    </button>

                    <div
                        className="v0-profile"
                        ref={profileRef}
                    >
                        <button
                            className="v0-profile-trigger dashboard-profile-simple"
                            type="button"
                            onClick={() =>
                                setProfileOpen((prev) => !prev)
                            }
                        >
                            <div className="v0-avatar">
                                {(user?.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="v0-user-text">
                                <strong>
                                    {user?.name || "User"}
                                </strong>

                                <small>
                                    {user?.email || "No email"}
                                </small>
                            </div>

                            <span className="v0-chevron">
                                ▼
                            </span>
                        </button>

                        {profileOpen && (
                            <div className="v0-dropdown v0-profile-menu">
                                <div className="v0-profile-card">
                                    <div className="v0-avatar large">
                                        {(user?.name || "U")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <strong>
                                            {user?.name || "User"}
                                        </strong>

                                        <small>
                                            {user?.email || "No email"}
                                        </small>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/settings")
                                    }
                                >
                                    ⚙️ {t.settings}
                                </button>

                                <button
                                    type="button"
                                    className="logout"
                                    onClick={handleLogout}
                                >
                                    🚪 {t.logout}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <AddTransactionModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onTransactionAdded={() => {
                    window.dispatchEvent(new Event("transactions-updated"));
                }}
            />
        </>
    );
}

export default Topbar;