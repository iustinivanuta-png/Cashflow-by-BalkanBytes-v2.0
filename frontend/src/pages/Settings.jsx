import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://localhost:4000";

function Settings() {
    const navigate = useNavigate();

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const fetchProfile = async () => {
        try {
            setError("");
            setLoading(true);

            const res = await fetch(`${API}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Nu s-a putut încărca profilul");
            }

            setProfileForm({
                name: data.user.name || "",
                email: data.user.email || "",
            });

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                })
            );
        } catch (err) {
            console.error(err);
            setError(err.message || "Eroare la încărcarea profilului");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!profileForm.name.trim() || !profileForm.email.trim()) {
            setError("Completează numele și email-ul");
            return;
        }

        try {
            setSavingProfile(true);

            const res = await fetch(`${API}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: profileForm.name.trim(),
                    email: profileForm.email.trim(),
                }),
            });

            const data = await res.json();

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || "Nu s-a putut salva profilul");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                })
            );

            setSuccess("Profil actualizat cu succes");
        } catch (err) {
            console.error(err);
            setError(err.message || "Eroare la salvarea profilului");
        } finally {
            setSavingProfile(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !passwordForm.currentPassword.trim() ||
            !passwordForm.newPassword.trim() ||
            !passwordForm.confirmPassword.trim()
        ) {
            setError("Completează toate câmpurile pentru parolă");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError("Noua parolă trebuie să aibă minim 6 caractere");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("Parolele noi nu se potrivesc");
            return;
        }

        try {
            setSavingPassword(true);

            const res = await fetch(`${API}/auth/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(passwordForm),
            });

            const data = await res.json();

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || "Nu s-a putut schimba parola");
            }

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setSuccess("Parola a fost schimbată cu succes");
        } catch (err) {
            console.error(err);
            setError(err.message || "Eroare la schimbarea parolei");
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="app page-enter">
                <div className="dashboard-layout">
                    <aside className="sidebar glass">
                        <div className="sidebar-logo">
                            <div className="sidebar-logo-icon">📊</div>
                            <div>
                                <h2>CashFlow</h2>
                                <p>Finance App</p>
                            </div>
                        </div>
                    </aside>

                    <main className="dashboard-main">
                        <div className="dashboard-loader glass">
                            <span className="spinner"></span>
                            <h2>Se încarcă setările...</h2>
                            <p>Te rugăm să aștepți puțin.</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="app page-enter">
            <div className="bg-orb orb1"></div>
            <div className="bg-orb orb2"></div>
            <div className="bg-orb orb3"></div>

            <div className="dashboard-layout">
                <aside className="sidebar glass">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">📊</div>
                        <div>
                            <h2>CashFlow</h2>
                            <p>Finance App</p>
                        </div>
                    </div>

                    <nav className="sidebar-menu">
                        <button className="sidebar-item" onClick={() => navigate("/")}>
                            Dashboard
                        </button>
                        <button className="sidebar-item" onClick={() => navigate("/transactions")}>
                            Transactions
                        </button>
                        <button className="sidebar-item" onClick={() => navigate("/reports")}>
                            Reports
                        </button>
                        <button className="sidebar-item" onClick={() => navigate("/analytics")}>
                            Analytics
                        </button>
                        <button
                            className="sidebar-item active"
                            onClick={() => navigate("/settings")}
                        >
                            Settings
                        </button>
                    </nav>

                    <div className="sidebar-user">
                        <strong>{storedUser?.name || "User"}</strong>
                        <span>{storedUser?.email || "No email"}</span>
                    </div>
                </aside>

                <main className="dashboard-main">
                    <header className="topbar glass fade-up delay-1">
                        <div>
                            <h1 className="topbar-title">Settings</h1>
                            <p className="topbar-subtitle">
                                Profile, password and account preferences
                            </p>
                        </div>

                        <div className="header-actions">
                            <button className="theme-btn" onClick={handleThemeToggle}>
                                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
                            </button>

                            <button className="delete-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </header>

                    {error && <div className="error-box">{error}</div>}
                    {success && <div className="success-box">{success}</div>}

                    <section className="dashboard-grid-middle fade-up delay-2">
                        <div className="glass panel">
                            <h2>Profile Card</h2>

                            <div className="profile-card">
                                <div className="avatar-placeholder">
                                    {(profileForm.name || "U").charAt(0).toUpperCase()}
                                </div>

                                <div className="profile-meta">
                                    <strong>{profileForm.name || "User"}</strong>
                                    <span>{profileForm.email || "No email"}</span>
                                </div>
                            </div>

                            <div className="mini-summary top-space">
                                <div className="mini-summary-item">
                                    <span>Account Type</span>
                                    <strong>Standard User</strong>
                                </div>

                                <div className="mini-summary-item">
                                    <span>Theme</span>
                                    <strong>{theme === "dark" ? "Dark Mode" : "Light Mode"}</strong>
                                </div>

                                <div className="mini-summary-item">
                                    <span>Session</span>
                                    <strong>JWT Auth</strong>
                                </div>
                            </div>
                        </div>

                        <div className="glass panel">
                            <h2>Edit Profile</h2>

                            <form className="transaction-form" onSubmit={saveProfile}>
                                <div className="field">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileForm.name}
                                        onChange={handleProfileChange}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <button className="add-btn" type="submit" disabled={savingProfile}>
                                    {savingProfile ? "Saving..." : "Save Profile"}
                                </button>
                            </form>
                        </div>

                        <div className="glass panel">
                            <h2>Change Password</h2>

                            <form className="transaction-form" onSubmit={changePassword}>
                                <div className="field">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Current password"
                                    />
                                </div>

                                <div className="field">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>

                                <div className="field">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Repeat new password"
                                    />
                                </div>

                                <button className="add-btn" type="submit" disabled={savingPassword}>
                                    {savingPassword ? "Updating..." : "Change Password"}
                                </button>
                            </form>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Settings;