import { useEffect, useState } from "react";
import "../App.css";
import "../Settings.css";
import { useLanguage } from "../useLanguage";

const API = "";

function EyeIcon({ hidden }) {
    return hidden ? (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
                d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M9.9 4.24A10.69 10.69 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M14.12 14.12A3 3 0 0 1 9.88 9.88"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M1 1l22 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );
}

function Settings() {
    const languageContext = useLanguage();
    const { lang } = languageContext;

    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        provider: "local",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const token = localStorage.getItem("token");

    const t = {
        loading: lang === "ro" ? "Se încarcă setările..." : "Loading settings...",
        settings: lang === "ro" ? "Setări" : "Settings",
        subtitle:
            lang === "ro"
                ? "Gestionează contul și preferințele aplicației tale."
                : "Manage your account and app preferences.",

        account: lang === "ro" ? "Cont" : "Account",
        accountSubtitle:
            lang === "ro"
                ? "Informațiile profilului tău."
                : "Your profile information.",
        profile: lang === "ro" ? "Profil" : "Profile",
        profileSubtitle:
            lang === "ro"
                ? "Detaliile contului și sesiunea curentă."
                : "Your account details and current session.",

        preferences: lang === "ro" ? "Preferințe aplicație" : "App Preferences",
        preferencesSubtitle:
            lang === "ro"
                ? "Personalizează experiența aplicației."
                : "Customize your app experience.",
        language: lang === "ro" ? "Limbă" : "Language",
        romanian: lang === "ro" ? "Română" : "Romanian",
        english: lang === "ro" ? "Engleză" : "English",

        security: lang === "ro" ? "Parolă și securitate" : "Password & Security",
        securitySubtitle:
            lang === "ro" ? "Protejează-ți contul." : "Protect your account.",
        changePassword: lang === "ro" ? "Schimbă parola" : "Change password",
        changePasswordSubtitle:
            lang === "ro"
                ? "Actualizează parola contului tău."
                : "Update your account password.",
        passwordInfo:
            lang === "ro"
                ? "Parola trebuie să fie cel puțin 6 caractere."
                : "Password must be at least 6 characters.",
        currentPassword: lang === "ro" ? "Parola actuală" : "Current password",
        newPassword: lang === "ro" ? "Parola nouă" : "New password",
        confirmPassword: lang === "ro" ? "Confirmă parola nouă" : "Confirm new password",
        forgotPassword: lang === "ro" ? "Ai uitat parola?" : "Forgot password?",
        saving: lang === "ro" ? "Se salvează..." : "Saving...",

        data: lang === "ro" ? "Date și cont" : "Data & Account",
        dataSubtitle: lang === "ro" ? "Gestionează datele tale." : "Manage your data.",
        deleteAllData: lang === "ro" ? "Șterge toate datele" : "Delete all data",
        deleteWarning:
            lang === "ro"
                ? "Această acțiune nu poate fi anulată."
                : "This action cannot be undone.",

        aboutGroup: lang === "ro" ? "Despre" : "About",
        aboutGroupSubtitle: lang === "ro" ? "Informații despre aplicație." : "App information.",
        about: lang === "ro" ? "Despre CashFlow" : "About CashFlow",
        version: lang === "ro" ? "Versiune 1.0.0" : "Version 1.0.0",
        appDescription:
            lang === "ro"
                ? "Aplicație pentru gestionarea finanțelor personale."
                : "Personal finance management app.",
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
                throw new Error(
                    data.error ||
                    (lang === "ro"
                        ? "Nu s-a putut încărca profilul."
                        : "Could not load profile.")
                );
            }

            setProfileForm({
                name: data.user.name || "",
                email: data.user.email || "",
                provider: data.user.provider || "local",
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordError("");
        setPasswordSuccess("");
        setShowPasswords({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false,
        });
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const changePassword = async (e) => {
        e.preventDefault();

        if (profileForm.provider !== "local") {
            return;
        }

        setPasswordError("");
        setPasswordSuccess("");

        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {
            setPasswordError(
                lang === "ro"
                    ? "Completează toate câmpurile."
                    : "Fill in all fields."
            );
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError(
                lang === "ro"
                    ? "Parola nouă trebuie să aibă cel puțin 6 caractere."
                    : "New password must be at least 6 characters."
            );
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError(
                lang === "ro"
                    ? "Parolele nu coincid."
                    : "Passwords do not match."
            );
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

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    (lang === "ro"
                        ? "Nu s-a putut schimba parola. Verifică parola actuală."
                        : "Password could not be changed. Check your current password.")
                );
            }

            setPasswordSuccess(
                lang === "ro"
                    ? "Parola a fost schimbată cu succes."
                    : "Password changed successfully."
            );

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setShowPasswords({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
            });
        } catch (err) {
            setPasswordError(
                err.message ||
                (lang === "ro"
                    ? "Eroare la schimbarea parolei."
                    : "Error while changing password.")
            );
        } finally {
            setSavingPassword(false);
        }
    };

    const handleForgotPassword = () => {
        window.location.href = "/forgot-password";
    };

    const handleDeleteAllData = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAllData = async () => {
        try {
            const res = await fetch(`${API}/api/transactions/all`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Nu s-au putut șterge datele.");
            }

            setShowDeleteModal(false);

            window.dispatchEvent(new Event("transactions-updated"));

            alert(
                lang === "ro"
                    ? "Toate datele au fost șterse cu succes."
                    : "All data has been deleted successfully."
            );
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleLanguage = () => {
        const nextLang = lang === "ro" ? "en" : "ro";

        if (typeof languageContext.setLang === "function") {
            languageContext.setLang(nextLang);
            return;
        }

        if (typeof languageContext.changeLanguage === "function") {
            languageContext.changeLanguage(nextLang);
            return;
        }

        localStorage.setItem("lang", nextLang);
        localStorage.setItem("language", nextLang);
        window.location.reload();
    };

    const SectionTitle = ({ dotClass, title }) => (
        <div className="settings-group-title">
            <span className={`settings-group-dot ${dotClass}`}>●</span>
            <div>
                <h2>{title}</h2>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-loader glass page-enter">
                <span className="spinner"></span>
                <h2>{t.loading}</h2>
            </div>
        );
    }

    return (
        <div className="settings-instagram-page page-enter">
            {error && <div className="error-box">{error}</div>}

            <div className="settings-hero-card">
                <div className="settings-hero-icon">⚙</div>

                <div>
                    <h1>{t.settings}</h1>
                </div>
            </div>

            <section className="settings-section-block">
                <SectionTitle
                    dotClass="settings-purple-dot"
                    title={t.account}
                />

                <button className="settings-list-item" type="button">
                    <span className="settings-list-icon settings-icon-profile">👤</span>
                    <span className="settings-list-text">
                        <strong>{t.profile}</strong>
                        <small>
                            {(profileForm.name || "User") + " • " + (profileForm.email || "No email")}
                        </small>
                    </span>
                    <span className="settings-list-action">›</span>
                </button>
            </section>

            <section className="settings-section-block">
                <SectionTitle
                    dotClass="settings-blue-dot"
                    title={t.preferences}
                />

                <button className="settings-list-item" type="button" onClick={toggleLanguage}>
                    <span className="settings-list-icon settings-icon-language">🌐</span>
                    <span className="settings-list-text">
                        <strong>{t.language}</strong>
                        <small>{lang === "ro" ? t.romanian : t.english}</small>
                    </span>
                    <span className="settings-pill">
                        {lang === "ro" ? "🇷🇴 Română" : "🇺🇸 English"}
                    </span>
                    <span className="settings-list-action">›</span>
                </button>
            </section>

            <section className="settings-section-block">
                <SectionTitle
                    dotClass="settings-green-dot"
                    title={t.security}
                />

                <button
                    className="settings-list-item"
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                >
                    <span className="settings-list-icon settings-icon-security">🔒</span>
                    <span className="settings-list-text">
                        <strong>{t.changePassword}</strong>
                        <small>{t.changePasswordSubtitle}</small>
                    </span>
                    <span className="settings-list-action">›</span>
                </button>
            </section>

            <section className="settings-section-block">
                <SectionTitle
                    dotClass="settings-red-dot"
                    title={t.data}
                />

                <button
                    className="settings-list-item settings-danger-item"
                    type="button"
                    onClick={handleDeleteAllData}
                >
                    <span className="settings-list-icon settings-icon-danger">🗑</span>
                    <span className="settings-list-text">
                        <strong>{t.deleteAllData}</strong>
                        <small>{t.deleteWarning}</small>
                    </span>
                    <span className="settings-list-action">›</span>
                </button>
            </section>

            <section className="settings-section-block">
                <SectionTitle
                    dotClass="settings-info-dot"
                    title={t.aboutGroup}
                />

                <button className="settings-list-item" type="button">
                    <span className="settings-list-icon settings-icon-about">ⓘ</span>
                    <span className="settings-list-text">
                        <strong>{t.about}</strong>
                        <small>{t.appDescription}</small>
                    </span>
                    <span className="settings-version-pill">{t.version}</span>
                    <span className="settings-list-action">›</span>
                </button>
            </section>

            {showPasswordModal && (
                <div className="settings-password-backdrop">
                    <form className="settings-password-modal" onSubmit={changePassword}>
                        <button
                            type="button"
                            className="settings-password-close"
                            onClick={closePasswordModal}
                        >
                            ×
                        </button>

                        <div className="settings-password-head">
                            <span className="settings-list-icon settings-icon-security">🔒</span>
                            <div>
                                <h2>{t.changePassword}</h2>
                                <p>{t.passwordInfo}</p>
                            </div>
                        </div>

                        <div className="settings-password-fields">
                            {profileForm.provider !== "local" ? (
                                <div className="settings-password-error">
                                    {lang === "ro"
                                        ? `Acest cont folosește autentificare ${profileForm.provider}. Parola se gestionează din contul respectiv.`
                                        : `This account uses ${profileForm.provider} authentication. Password is managed by that provider.`}
                                </div>
                            ) : (
                                <>
                                    {passwordError && (
                                        <div className="settings-password-error">
                                            {passwordError}
                                        </div>
                                    )}

                                    {passwordSuccess && (
                                        <div className="settings-password-success">
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    <div className="settings-password-input-wrap">
                                        <input
                                            type={showPasswords.currentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder={t.currentPassword}
                                            autoComplete="current-password"
                                        />

                                        <button
                                            type="button"
                                            className={`settings-password-eye ${passwordForm.currentPassword ? "visible" : "hidden"}`}
                                            onClick={() => togglePasswordVisibility("currentPassword")}
                                        >
                                            <EyeIcon hidden={showPasswords.currentPassword} />
                                        </button>
                                    </div>

                                    <div className="settings-password-input-wrap">
                                        <input
                                            type={showPasswords.newPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder={t.newPassword}
                                            autoComplete="new-password"
                                        />

                                        <button
                                            type="button"
                                            className={`settings-password-eye ${passwordForm.newPassword ? "visible" : "hidden"}`}
                                            onClick={() => togglePasswordVisibility("newPassword")}
                                        >
                                            <EyeIcon hidden={showPasswords.newPassword} />
                                        </button>
                                    </div>

                                    <div className="settings-password-input-wrap">
                                        <input
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder={t.confirmPassword}
                                            autoComplete="new-password"
                                        />

                                        <button
                                            type="button"
                                            className={`settings-password-eye ${passwordForm.confirmPassword ? "visible" : "hidden"}`}
                                            onClick={() => togglePasswordVisibility("confirmPassword")}
                                        >
                                            <EyeIcon hidden={showPasswords.confirmPassword} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {profileForm.provider === "local" && (
                            <>
                                <button
                                    type="button"
                                    className="settings-forgot-password"
                                    onClick={handleForgotPassword}
                                >
                                    {t.forgotPassword}
                                </button>

                                <button
                                    type="submit"
                                    className="settings-password-submit"
                                    disabled={savingPassword}
                                >
                                    {savingPassword ? t.saving : t.changePassword}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            )}

            {showDeleteModal && (
                <div className="settings-password-backdrop">
                    <div className="settings-password-modal settings-delete-modal">
                        <button
                            type="button"
                            className="settings-password-close"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            ×
                        </button>

                        <div className="settings-password-head">
                            <span className="settings-list-icon settings-icon-danger">
                                🗑
                            </span>

                            <div>
                                <h2>
                                    {lang === "ro"
                                        ? "Șterge toate datele?"
                                        : "Delete all data?"}
                                </h2>

                                <p>
                                    {lang === "ro"
                                        ? "Vor fi șterse toate tranzacțiile, statisticile, rapoartele și istoricul financiar salvat în aplicație."
                                        : "All transactions, statistics, reports and financial history will be deleted."}
                                </p>
                            </div>
                        </div>

                        <div className="settings-delete-warning">
                            {lang === "ro"
                                ? "Această acțiune este permanentă și nu poate fi anulată."
                                : "This action is permanent and cannot be undone."}
                        </div>

                        <div className="settings-delete-actions">
                            <button
                                type="button"
                                className="settings-delete-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                {lang === "ro" ? "Anulează" : "Cancel"}
                            </button>

                            <button
                                type="button"
                                className="settings-delete-confirm"
                                onClick={confirmDeleteAllData}
                            >
                                {lang === "ro"
                                    ? "Da, șterge datele"
                                    : "Yes, delete data"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
