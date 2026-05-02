import { useState } from "react";
import "./LanguageSelector.css";

const languages = [
    {
        code: "ro",
        label: "Română",
        short: "RO",
        flag: "https://flagcdn.com/w40/ro.png",
    },
    {
        code: "en",
        label: "English",
        short: "EN",
        flag: "https://flagcdn.com/w40/us.png",
    },
];

function LanguageSelector({ lang, setLang }) {
    const [open, setOpen] = useState(false);

    const current = languages.find((l) => l.code === lang);

    const handleSelect = (code) => {
        setLang(code);
        localStorage.setItem("lang", code);
        setOpen(false);
    };

    return (
        <div className="rev-lang">
            <button className="rev-lang-current" onClick={() => setOpen(!open)}>
                <img src={current.flag} alt="" />
                <span>{current.label}</span>
                <svg viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className="rev-lang-menu">
                    {languages.map((l) => (
                        <button
                            key={l.code}
                            className={
                                lang === l.code
                                    ? "rev-lang-option active"
                                    : "rev-lang-option"
                            }
                            onClick={() => handleSelect(l.code)}
                        >
                            <img src={l.flag} alt="" />
                            <span>{l.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;