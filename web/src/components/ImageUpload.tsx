import { useState, useRef, useCallback } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File, imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, disabled = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('不支持的文件格式，请选择 JPG、PNG、GIF 或 WebP 格式的图片');
      return false;
    }

    // 检查文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('文件太大，请选择小于 10MB 的图片');
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) {
      return;
    }

    // 创建预览 URL
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    setFileName(file.name);
    onImageSelect(file, imageUrl);
  }, [onImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  }, [disabled, handleFile]);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <label className="upload-label">
        本地图片上传
      </label>
      
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          <div className="preview-content">
            <img src={previewUrl} alt="预览" className="preview-image" />
            <div className="preview-overlay">
              <span className="file-name">{fileName}</span>
              <button 
                className="btn-change"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                更换图片
              </button>
              <button 
                className="btn-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                移除
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p className="upload-text">
              点击选择图片或拖拽图片到此处
            </p>
            <p className="upload-hint">
              支持 JPG、PNG、GIF、WebP 格式，最大 10MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="file-input"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default ImageUpload;
