import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },

            "/auth/me": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },

            "/auth/profile": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },

            "/auth/change-password": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },

            "/auth/google": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },

            "/auth/facebook": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },
        },
    },
});