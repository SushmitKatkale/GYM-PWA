import React, { useState, useRef, useEffect } from 'react';
import { X, Image, Upload, CheckCircle, XCircle, Camera, Trash2 } from 'lucide-react';
import { imageService } from '../../services/imageService';
import { useAuthStore } from '../../stores/authStore';

interface UploadedImage {
  file: File;
  previewUrl: string;
  id: string;
}

interface Gym {
  id: number;
  name: string;
  images?: string[];
}

interface GymImageEditModalProps {
  gym: Gym | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gymId: number, images: string[]) => void;
}

const GymImageEditModal: React.FC<GymImageEditModalProps> = ({ 
  gym, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getAccessToken } = useAuthStore();
  const maxImages = 10;

  useEffect(() => {
    if (gym && isOpen) {
      setImageUrls(gym.images || []);
      setImages([]);
      setUploadError(null);
    }
  }, [gym, isOpen]);

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: UploadedImage[] = [];
    let errorMessages: string[] = [];

    // Check if adding these files would exceed the limit
    if (images.length + imageUrls.length + fileArray.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length - imageUrls.length} more.`);
      return;
    }

    fileArray.forEach((file) => {
      // Validate each file
      const validation = imageService.validateImage(file);
      if (!validation.valid) {
        errorMessages.push(`${file.name}: ${validation.error}`);
        return;
      }

      // Check if file already exists
      const existingFile = images.find(img => img.file.name === file.name && img.file.size === file.size);
      if (existingFile) {
        errorMessages.push(`${file.name}: File already added`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = imageService.createPreviewUrl(file);
      
      validFiles.push({
        file,
        previewUrl,
        id
      });
    });

    if (errorMessages.length > 0) {
      setUploadError(errorMessages.join('; '));
    } else {
      setUploadError(null);
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const filesCopy = Array.from(files);
      processFiles(filesCopy);
    }
    
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      } else {
        setUploadError('Please select valid image files');
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      imageService.revokePreviewUrl(imageToRemove.previewUrl);
    }
    
    setImages(prev => prev.filter(img => img.id !== imageId));
    setUploadError(null);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImageUrls(prev => prev.filter(url => url !== imageUrl));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!gym) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        alert('Authentication required. Please log in.');
        return;
      }

      // Upload new images
      let newImageUrls: string[] = [];
      if (images.length > 0) {
        const uploadResults = await imageService.uploadMultipleGymImages(
          images.map(img => img.file), 
          token
        );
        
        for (const result of uploadResults) {
          if (result.success && result.data) {
            newImageUrls.push(result.data.url);
          } else {
            console.error('Failed to upload image:', result.message);
          }
        }
      }

      // Combine existing and new image URLs
      const allImageUrls = [...imageUrls, ...newImageUrls];
      
      // Call the onSave callback with the gym ID and updated image URLs
      onSave(gym.id, allImageUrls);
      
      // Clean up preview URLs
      images.forEach(img => imageService.revokePreviewUrl(img.previewUrl));
      
      onClose();
    } catch (error) {
      console.error('Error saving images:', error);
      alert('Error saving images');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    images.forEach(img => imageService.revokePreviewUrl(img.previewUrl));
    setImages([]);
    setImageUrls([]);
    setUploadError(null);
    onClose();
  };

  if (!isOpen || !gym) return null;

  const totalImages = images.length + imageUrls.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Edit Images - {gym.name}</h2>
            <p className="text-sm text-gray-600">Manage gym photos ({totalImages}/{maxImages})</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload new images */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50'
                : uploadError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                uploadError ? 'bg-red-100' : 'bg-indigo-100'
              }`}>
                {uploadError ? (
                  <XCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <Camera className="w-8 h-8 text-indigo-600" />
                )}
              </div>

              <div>
                <p className={`text-lg font-medium ${
                  uploadError ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {uploadError ? 'Upload Failed' : isDragOver ? 'Drop images here' : 'Upload gym images'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {uploadError ? uploadError : 'Drag and drop or click to browse'}
                </p>
              </div>

              {!uploadError && (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>•</span>
                  <span>JPEG, PNG, WebP up to 5MB</span>
                  <span>•</span>
                  <span>Max 2048x2048px per image</span>
                  <span>•</span>
                  <span>Max {maxImages} images</span>
                </div>
              )}
            </div>
          </div>

          {/* Display all images */}
          {totalImages > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Images ({totalImages})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Existing images */}
                {imageUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={url}
                      alt="Gym"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => handleRemoveExistingImage(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Existing
                    </div>
                  </div>
                ))}

                {/* New images */}
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.previewUrl}
                      alt="Gym"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      New
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📸 Image Guidelines:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use high-quality photos that showcase your gym's best features</li>
              <li>• Ensure good lighting and clear visibility of equipment/space</li>
              <li>• Avoid cluttered or poorly lit images</li>
              <li>• Consider showing people using the gym (with permission)</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Images'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GymImageEditModal;
