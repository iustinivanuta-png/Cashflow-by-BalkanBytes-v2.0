import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import WelcomePage from "./pages/WelcomePage";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import OAuthSuccess from "./pages/OAuthSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
    const token = localStorage.getItem("token");

    return (
        <Routes>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            <Route
                path="/auth"
                element={!token ? <AuthPage /> : <Navigate to="/" replace />}
            />

            <Route
                path="/"
                element={token ? <Dashboard /> : <Navigate to="/welcome" replace />}
            />

            <Route
                path="/transactions"
                element={token ? <Transactions /> : <Navigate to="/auth" replace />}
            />

            <Route
                path="/reports"
                element={token ? <Reports /> : <Navigate to="/auth" replace />}
            />

            <Route
                path="/analytics"
                element={token ? <Analytics /> : <Navigate to="/auth" replace />}
            />

            <Route
                path="/settings"
                element={token ? <Settings /> : <Navigate to="/auth" replace />}
            />

            <Route path="*" element={<Navigate to="/welcome" replace />} />

            <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
    );
}

export default App;