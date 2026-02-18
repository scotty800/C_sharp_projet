import React, { useState } from "react";
import './Input.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    ...props
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="input-wrapper">
            {label && (
                <label className={`input-label ${error ? 'input-label-error' : ''}`}>
                    {label} {required && <span className="input-required">*</span>}
                </label>
            )}

            <div className={`input-container ${error ? 'input-error' : ''} ${focused ? 'input-focused' : ''}`}>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="input-field"
                    {...props}
                />
            </div>

            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;