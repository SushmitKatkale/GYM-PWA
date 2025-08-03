import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { imageService, ImageUploadResponse } from '../../services/imageService';
import { useAuthStore } from '../../stores/authStore';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string | number;
  gymName: string;
  onSuccess: (uploadedImages: string[]) => void;
  maxImages?: number;
}

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'success' | 'error';
  response?: ImageUploadResponse;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  gymId,
  gymName,
  onSuccess,
  maxImages = 10
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getAccessToken } = useAuthStore();

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
    }

    // Create preview objects
    const newImages: UploadedImage[] = filesToProcess.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading' as const
    }));

    setImages(prev => [...prev, ...newImages]);
    setUploading(true);

    // Upload images one by one
    for (const imageObj of newImages) {
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await imageService.uploadGymImage(
          imageObj.file,
          gymId,
          token,
          `${gymName} - Image`,
          'Admin'
        );

        setImages(prev => prev.map(img => 
          img.id === imageObj.id 
            ? { ...img, status: response.success ? 'success' : 'error', response }
            : img
        ));
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === imageObj.id 
            ? { 
                ...img, 
                status: 'error', 
                response: { 
                  success: false, 
                  message: error instanceof Error ? error.message : 'Upload failed' 
                } 
              }
            : img
        ));
      }
    }

    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleSave = () => {
    const successfulUploads = images
      .filter(img => img.status === 'success' && img.response?.data?.url)
      .map(img => img.response!.data!.url);

    if (successfulUploads.length > 0) {
      onSuccess(successfulUploads);
    }
    
    handleClose();
  };

  const handleClose = () => {
    // Clean up preview URLs
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setUploading(false);
    onClose();
  };

  const successfulUploads = images.filter(img => img.status === 'success').length;
  const failedUploads = images.filter(img => img.status === 'error').length;
  const canSave = successfulUploads > 0 && !uploading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Images</h2>
            <p className="text-sm text-gray-600">Add images for {gymName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop images here or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Support for JPEG, JPG, PNG, WebP files up to 5MB each
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {images.length}/{maxImages} images selected
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Select Images
              </button>
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Upload Progress */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Upload Progress</h3>
                <div className="text-sm text-gray-600">
                  {successfulUploads} successful, {failedUploads} failed
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    {/* Image Preview */}
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <img
                        src={image.previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-cover"
                      />
                    </div>

                    {/* Status Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      {image.status === 'uploading' && (
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm">Uploading...</p>
                        </div>
                      )}
                      {image.status === 'success' && (
                        <div className="text-white text-center">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-sm">Uploaded</p>
                        </div>
                      )}
                      {image.status === 'error' && (
                        <div className="text-white text-center">
                          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <p className="text-sm">Failed</p>
                          {image.response?.message && (
                            <p className="text-xs mt-1 px-2">
                              {image.response.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Uploading images...
              </span>
            ) : (
              <span>
                {successfulUploads > 0 && `${successfulUploads} image(s) ready to save`}
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Images ({successfulUploads})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
