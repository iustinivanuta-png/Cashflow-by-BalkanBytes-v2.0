import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../ResetPassword.css";

const API = "http://localhost:4000";

function EyeIcon({ hidden }) {
    if (hidden) {
        return (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9.9 4.24A10.69 10.69 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            setLoading(true);

            const res = await fetch(`${API}/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const raw = await res.text();
            const data = raw ? JSON.parse(raw) : {};

            if (!res.ok) {
                throw new Error(data.error || "Eroare la resetarea parolei.");
            }

            setSuccess("Parola a fost resetată cu succes. Vei fi redirecționat către autentificare...");

            setForm({
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                navigate("/auth");
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fp-page">
            <form className="fp-card" onSubmit={handleSubmit}>
                <h1>Resetează parola</h1>
                <p>Introdu noua parolă pentru contul tău.</p>

                {error && <div className="fp-error">{error}</div>}
                {success && <div className="fp-success">{success}</div>}

                <div className="password-wrap">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Parolă nouă"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button
                        type="button"
                        className={`password-eye ${form.password ? "visible" : "hidden"}`}
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        <EyeIcon hidden={showPassword} />
                    </button>
                </div>

                <div className="password-wrap">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirmă parola"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />

                    <button
                        type="button"
                        className={`password-eye ${form.confirmPassword ? "visible" : "hidden"}`}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                        <EyeIcon hidden={showConfirmPassword} />
                    </button>
                </div>

                <button disabled={loading}>
                    {loading ? "Se salvează..." : "Resetează parola"}
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;