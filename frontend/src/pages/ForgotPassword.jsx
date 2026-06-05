import { useState } from "react";
import "../ForgotPassword.css";

const API = "http://localhost:4000";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            setLoading(true);

            const res = await fetch(`${API}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const raw = await res.text();

            let data = {};

            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                throw new Error(
                    "Backend-ul nu a returnat JSON. Verifică dacă serverul backend rulează pe http://localhost:4000 și dacă ruta /auth/forgot-password există."
                );
            }

            if (!res.ok) {
                throw new Error(data.error || "Eroare la trimiterea linkului.");
            }

            setSuccess(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fp-page">
            <form className="fp-card" onSubmit={handleSubmit}>
                <h1>Ai uitat parola?</h1>
                <p>Introdu emailul contului tău. Îți vom trimite linkul de resetare pe email.</p>

                {error && <div className="fp-error">{error}</div>}
                {success && <div className="fp-success">{success}</div>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button disabled={loading}>
                    {loading ? "Se trimite..." : "Trimite link"}
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;