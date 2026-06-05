import { useEffect, useRef, useState } from "react";

function CustomSelect({ options, value, onChange, placeholder = "Select", icon }) {
    const [open, setOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption = options.find((option) => option.value === value);

    return (
        <div className="cf-select" ref={selectRef}>
            <button
                type="button"
                className={open ? "cf-select-trigger open" : "cf-select-trigger"}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className="cf-select-left">
                    {icon && <span className="cf-select-icon">{icon}</span>}
                    <span>{selectedOption?.label || placeholder}</span>
                </span>

                <span className={open ? "cf-select-arrow rotate" : "cf-select-arrow"}>
                    ▾
                </span>
            </button>

            {open && (
                <div className="cf-select-menu">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={
                                option.value === value
                                    ? "cf-select-option active"
                                    : "cf-select-option"
                            }
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomSelect;
