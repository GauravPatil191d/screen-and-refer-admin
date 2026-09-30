"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Eye, EyeOff, FileText, Image as ImageIcon, Film } from "lucide-react";
import "./style.css";

export interface InputFieldProps {
  label?: string;
  type?: "text" | "password" | "textarea" | "file";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileSelect?: (fileUrl: string, file: File) => void;
  accept?: string;
  rows?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  previewUrl?: string;
  id?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onFileSelect,
  accept,
  rows = 4,
  error,
  required = false,
  disabled = false,
  className = "",
  icon,
  previewUrl,
  id,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(previewUrl || null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (previewUrl !== undefined) {
      setMediaPreview(previewUrl);
    }
  }, [previewUrl]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    if (onFileSelect) {
      onFileSelect(url, file);
    }
  };

  const isVideo = accept?.includes("video") || mediaPreview?.match(/\.(mp4|webm|ogg)$/i) || mediaPreview?.startsWith("data:video");

  return (
    <div className={`hexar-input-group ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={id} className="hexar-input-label">
          {label} {required && <span className="hexar-required">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <div className="hexar-input-wrapper">
          {icon && <span className="hexar-input-icon">{icon}</span>}
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`hexar-textarea ${icon ? "has-icon" : ""}`}
          />
        </div>
      ) : type === "file" ? (
        <div className="hexar-file-container">
          <div
            className={`hexar-file-dropzone ${dragActive ? "drag-active" : ""} ${mediaPreview ? "has-preview" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
          >
            <input
              id={id}
              type="file"
              accept={accept}
              disabled={disabled}
              className="hexar-file-input"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="hexar-file-content">
              <div className="hexar-upload-icon-box">
                {accept?.includes("video") ? (
                  <Film className="w-6 h-6 text-indigo-400" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div className="hexar-file-text">
                <span className="hexar-file-highlight">Click to upload</span> or drag and drop
              </div>
              <span className="hexar-file-hint">
                {accept ? `Supported: ${accept}` : "Images or Videos"}
              </span>
            </div>
          </div>

          {/* Media Preview Box */}
          {mediaPreview && (
            <div className="hexar-preview-card">
              <div className="hexar-preview-header">
                <span className="hexar-preview-title">
                  {isVideo ? "Video Preview" : "Image Preview"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPreview(null);
                    if (onFileSelect) onFileSelect("", null as any);
                  }}
                  className="hexar-preview-remove"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="hexar-preview-body">
                {isVideo ? (
                  <video src={mediaPreview} controls className="hexar-preview-video" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="hexar-preview-image" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hexar-input-wrapper">
          {icon && <span className="hexar-input-icon">{icon}</span>}
          <input
            id={id}
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`hexar-input ${icon ? "has-icon" : ""} ${type === "password" ? "has-toggle" : ""}`}
          />
          {type === "password" && (
            <button
              type="button"
              className="hexar-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}

      {error && <span className="hexar-input-error">{error}</span>}
    </div>
  );
};
