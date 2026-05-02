import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function OAuthSuccess() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const user = searchParams.get("user");

        if (!token || !user) {
            window.location.replace("/auth");
            return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", decodeURIComponent(user));

        if (!localStorage.getItem("accountType")) {
            localStorage.setItem("accountType", "personal");
        }

        window.location.replace("/");
    }, [searchParams]);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#000b14",
                color: "white",
                display: "grid",
                placeItems: "center",
                fontFamily: "Inter, Arial, sans-serif",
            }}
        >
            <h2>Se autentifică...</h2>
        </div>
    );
}

export default OAuthSuccess;