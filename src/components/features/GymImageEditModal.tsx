import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Trash2, Camera, Save } from 'lucide-react';
import { imageService, ImageUploadResponse } from '../../services/imageService';
import { useAuthStore } from '../../stores/authStore';
import { Gym } from '../../services/gymService';

interface GymImageEditModalProps {
  gym: Gym | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gymId: number, images: string[]) => void;
}

interface GymImage {
  id: string;
  url: string;
  type: 'existing' | 'new';
  file?: File;
  previewUrl?: string;
  status?: 'uploading' | 'success' | 'error' | 'deleting';
  response?: ImageUploadResponse;
  dbId?: number; // Database ID for existing images
}

const GymImageEditModal: React.FC<GymImageEditModalProps> = ({
  gym,
  isOpen,
  onClose,
  onSave
}) => {
  const [images, setImages] = useState<GymImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getAccessToken } = useAuthStore();

  const maxImages = 10;

  // Define handleClose early to avoid hoisting issues
  const handleClose = () => {
    // Clean up preview URLs for new images
    images
      .filter(img => img.type === 'new' && img.previewUrl)
      .forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    
    setImages([]);
    setUploading(false);
    setDragActive(false);
    onClose();
  };

  // Load existing images from API when modal opens
  const loadExistingImages = async (gymId: number) => {
    try {
      setLoading(true);
      const response = await imageService.getGymImages(gymId);
      
      if (response.success && response.data) {
        const existingImages: GymImage[] = response.data.map((imageData: any, index: number) => ({
          id: `existing-${imageData.id || index}`,
          url: imageData.fullUrl || imageData.path || '',
          type: 'existing' as const,
          previewUrl: imageData.fullUrl || imageData.path || '',
          dbId: imageData.id // Store the database ID for deletion
        }));
        
        setImages(existingImages);
      } else {
        console.warn('Failed to fetch existing images:', response.message);
        // Fallback to gym.images from props if API fails
        const existingImages: GymImage[] = gym?.images?.map((imageUrl: string, index: number) => ({
          id: `existing-${index}`,
          url: imageUrl,
          type: 'existing' as const,
          previewUrl: imageUrl
        })) || [];
        
        setImages(existingImages);
      }
    } catch (error) {
      console.error('Error loading existing images:', error);
      // Fallback to gym.images from props if API fails
      const existingImages: GymImage[] = gym?.images?.map((imageUrl: string, index: number) => ({
        id: `existing-${index}`,
        url: imageUrl,
        type: 'existing' as const,
        previewUrl: imageUrl
      })) || [];
      
      setImages(existingImages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && gym) {
      // Fetch latest images from API
      loadExistingImages(gym.id);
    } else if (!isOpen) {
      // Clean up when modal closes
      handleClose();
    }
  }, [isOpen, gym]);

  if (!isOpen || !gym) return null;

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
    }

    // Create preview objects for new files
    const newImages: GymImage[] = filesToProcess.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      url: '',
      type: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading'
    }));

    setImages(prev => [...prev, ...newImages]);
    setUploading(true);

    // Upload images one by one
    for (const imageObj of newImages) {
      if (!imageObj.file) continue;

      try {
        const response = await imageService.uploadGymImage(
          imageObj.file,
          gym.id,
          `${gym.name} - Image`,
          'Admin'
        );

        setImages(prev => prev.map(img => 
          img.id === imageObj.id 
            ? { 
                ...img, 
                status: response.success ? 'success' : 'error',
                response,
                url: response.success && response.data?.url ? response.data.url : ''
              }
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

  const removeImage = async (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (!imageToRemove) return;

    // If it's an existing image, delete it from the backend
    if (imageToRemove.type === 'existing' && imageToRemove.dbId) {
      try {
        // Set deleting status
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, status: 'deleting' } : img
        ));

        // Call backend to soft delete the image
        const response = await imageService.deleteGymImageById(imageToRemove.dbId);

        if (!response.success) {
          console.error('Failed to delete image:', response.message);
          alert('Failed to delete image from server. Please try again.');
          
          // Reset status if deletion failed
          setImages(prev => prev.map(img => 
            img.id === id ? { ...img, status: undefined } : img
          ));
          return;
        }

        console.log('Successfully deleted image from backend');
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Failed to delete image. Please check your connection and try again.');
        
        // Reset status if deletion failed
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, status: undefined } : img
        ));
        return;
      }
    }

    // Remove from local state (for both new and successfully deleted existing images)
    setImages(prev => {
      const updatedImages = prev.filter(img => img.id !== id);
      
      // Clean up preview URL for new images
      if (imageToRemove.previewUrl && imageToRemove.type === 'new') {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      
      return updatedImages;
    });
  };

  const handleSave = () => {
    if (!gym) return;

    // Collect all image URLs (existing + successfully uploaded new ones)
    const allImageUrls = images
      .filter(img => {
        if (img.type === 'existing') return true;
        return img.status === 'success' && img.url;
      })
      .map(img => img.url)
      .filter(Boolean);

    onSave(gym.id, allImageUrls);
    handleClose();
  };

  const existingImages = images.filter(img => img.type === 'existing');
  const newImages = images.filter(img => img.type === 'new');
  const successfulUploads = newImages.filter(img => img.status === 'success').length;
  const failedUploads = newImages.filter(img => img.status === 'error').length;
  const totalImages = images.length;
  const canSave = totalImages > 0 && !uploading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Manage Gym Images
            </h2>
            <p className="text-sm text-gray-600">
              Edit images for <span className="font-medium">{gym.name}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Loading existing images...</span>
            </div>
          )}
          
          {/* Current Images Display */}
          {!loading && images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Current Images</h3>
                <div className="text-sm text-gray-600">
                  {totalImages} of {maxImages} images
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group border rounded-lg overflow-hidden bg-gray-50"
                  >
                    {/* Image Preview */}
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <img
                        src={image.previewUrl || image.url}
                        alt="Gym image"
                        className="max-w-full max-h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Status Overlay for new images and deleting existing images */}
                    {(image.type === 'new' || image.status === 'deleting') && (
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
                        {image.status === 'deleting' && (
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Deleting...</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        image.type === 'existing' 
                          ? 'bg-blue-100 text-blue-800' 
                          : image.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : image.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {image.type === 'existing' ? 'Current' : 'New'}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      disabled={image.status === 'deleting' || image.status === 'uploading'}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Status Summary */}
              {newImages.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    New uploads: {successfulUploads} successful, {failedUploads} failed
                  </div>
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Uploading images...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Area */}
          {!loading && images.length < maxImages && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Add More Images</h3>
              
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
                      {images.length}/{maxImages} images used
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
            </div>
          )}

          {/* Empty State */}
          {!loading && images.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Images</h3>
              <p className="text-gray-600 mb-4">
                This gym doesn't have any images yet. Upload some to showcase the facilities.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload First Image
              </button>
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
                {totalImages > 0 && `${totalImages} image(s) ready`}
                {successfulUploads > 0 && ` (${successfulUploads} new)`}
              </span>
            )}
          </div>
          
          {/* <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes ({totalImages})
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default GymImageEditModal;
