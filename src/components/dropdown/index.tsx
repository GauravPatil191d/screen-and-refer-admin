"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import "./style.css";

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  searchable = false,
  error,
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`hexar-dropdown-container ${error ? "has-error" : ""} ${className}`} ref={dropdownRef}>
      {label && (
        <label className="hexar-dropdown-label">
          {label} {required && <span className="hexar-required">*</span>}
        </label>
      )}

      <div
        className={`hexar-dropdown-trigger ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="hexar-dropdown-selected">
          {selectedOption ? (
            <span className="hexar-selected-content">
              {selectedOption.icon && <span className="hexar-opt-icon">{selectedOption.icon}</span>}
              <span className="hexar-opt-label">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="hexar-opt-badge">{selectedOption.badge}</span>
              )}
            </span>
          ) : (
            <span className="hexar-placeholder">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`hexar-chevron ${isOpen ? "rotate" : ""}`} />
      </div>

      {isOpen && (
        <div className="hexar-dropdown-menu">
          {searchable && (
            <div className="hexar-dropdown-search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hexar-dropdown-search-input"
                autoFocus
              />
            </div>
          )}

          <div className="hexar-dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    className={`hexar-dropdown-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <div className="hexar-item-left">
                      {opt.icon && <span className="hexar-opt-icon">{opt.icon}</span>}
                      <span>{opt.label}</span>
                      {opt.badge && <span className="hexar-opt-badge">{opt.badge}</span>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                );
              })
            ) : (
              <div className="hexar-dropdown-empty">No options found</div>
            )}
          </div>
        </div>
      )}

      {error && <span className="hexar-dropdown-error">{error}</span>}
    </div>
  );
};
