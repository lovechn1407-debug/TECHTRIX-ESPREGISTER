import React, { useState, useRef } from 'react';
import { UploadCloud, Image, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function FileUpload({
  label = 'Upload Image',
  description = 'PNG, JPG, or WEBP up to 10MB',
  required = false,
  previewUrl = null,
  isUploading = false,
  uploadedUrl = null,
  error = null,
  onFileSelect,
  onRemove,
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`file-upload-group ${className}`} style={{ marginBottom: '1.25rem' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600 }}>
          <span>
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
          </span>
          {uploadedUrl && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.78rem' }}>
              <CheckCircle2 size={13} />
              <span>Ready</span>
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {previewUrl || uploadedUrl ? (
        <div className="file-preview-card">
          <img
            src={previewUrl || uploadedUrl}
            alt="Preview"
            className="file-thumbnail"
          />
          <div className="file-info">
            <div className="file-name">Image selected</div>
            <div className="file-size">
              {isUploading ? (
                <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                  Uploading to ImgBB...
                </span>
              ) : uploadedUrl ? (
                <span style={{ color: 'var(--success)' }}>Uploaded to ImgBB</span>
              ) : (
                <span>Ready to upload</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.value = '';
              onRemove && onRemove();
            }}
            title="Remove image"
            style={{ color: 'var(--danger)', padding: '0.4rem' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
        >
          <div className="file-dropzone-icon">
            <UploadCloud size={24} />
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            Click to upload or drag & drop
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {description}
          </div>
        </div>
      )}

      {error && (
        <div className="input-error-msg" style={{ marginTop: '0.4rem' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
