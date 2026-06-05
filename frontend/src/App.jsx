import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import WelcomePage from "./pages/WelcomePage";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import OAuthSuccess from "./pages/OAuthSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Savings from "./pages/Savings";



import AppLayout from "./components/AppLayout";

import { LanguageProvider } from "./LanguageContext";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
    const token = localStorage.getItem("token");

    return (
        <LanguageProvider>
            <Routes>
                <Route
                    path="/welcome"
                    element={<WelcomePage />}
                />

                <Route
                    path="/oauth-success"
                    element={<OAuthSuccess />}
                />

                <Route
                    path="/privacy"
                    element={<PrivacyPolicy />}
                />

                <Route
                    path="/auth"
                    element={
                        !token ? (
                            <AuthPage />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                <Route
                    element={
                        token ? (
                            <AppLayout />
                        ) : (
                            <Navigate to="/auth" replace />
                        )
                    }
                >
                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/transactions"
                        element={<Transactions />}
                    />

                    <Route
                        path="/savings"
                        element={<Savings />}
                    />

                    <Route
                        path="/analytics"
                        element={<Analytics />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />
                </Route>

                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/welcome" replace />}
                />

               
            </Routes>
        </LanguageProvider>
    );
}

export default App;