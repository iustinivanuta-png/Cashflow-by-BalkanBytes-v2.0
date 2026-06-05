import { createContext, useEffect, useState } from "react";
import translations from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(
        localStorage.getItem("lang") || "ro"
    );

    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    const t = translations[lang] || translations.ro;

    return (
        <LanguageContext.Provider
            value={{ lang, setLang, t }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export { LanguageContext };