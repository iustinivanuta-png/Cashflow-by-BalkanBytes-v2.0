import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function App() {
    const token = localStorage.getItem("token");

    return (
        <Routes>
            <Route
                path="/"
                element={token ? <Dashboard /> : <Navigate to="/auth" replace />}
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
            <Route
                path="/auth"
                element={!token ? <AuthPage /> : <Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;