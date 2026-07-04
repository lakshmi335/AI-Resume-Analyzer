import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

const FileUpload = ({ onFileSelect, file, onClear }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  if (file) {
    return (
      <div className="file-selected">
        <FileText size={24} className="file-icon" />
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
        </div>
        <button onClick={onClear} className="file-clear">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload size={32} className="dropzone-icon" />
      <p className="dropzone-title">
        {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume'}
      </p>
      <p className="dropzone-sub">or click to browse — PDF only, max 5MB</p>
    </div>
  );
};

export default FileUpload;
