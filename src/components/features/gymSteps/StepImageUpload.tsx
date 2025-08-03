import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, CheckCircle, XCircle, Camera, Trash2, Plus } from 'lucide-react';
import { imageService } from '../../../services/imageService';

interface UploadedImage {
  file: File;
  previewUrl: string;
  id: string;
}

interface FormData {
  images: UploadedImage[];
  imageUrls: string[];
  [key: string]: any;
}

interface StepImageUploadProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

const StepImageUpload: React.FC<StepImageUploadProps> = ({ formData, onChange }) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxImages = 10;

  // Track when formData changes
  useEffect(() => {
    console.log('[DEBUG] formData changed, images count:', formData.images?.length || 0);
    console.log('[DEBUG] formData.images:', formData.images);
  }, [formData.images]);

  const processFiles = (files: FileList | File[]) => {
    console.log('[DEBUG] processFiles called with', files.length, 'files');
    console.log('[DEBUG] Current images count:', formData.images.length);
    
    const fileArray = Array.from(files);
    const validFiles: UploadedImage[] = [];
    let errorMessages: string[] = [];

    // Check if adding these files would exceed the limit
    if (formData.images.length + fileArray.length > maxImages) {
      console.log('[DEBUG] Max images exceeded');
      setUploadError(`Maximum ${maxImages} images allowed. You can add ${maxImages - formData.images.length} more.`);
      return;
    }

    fileArray.forEach((file) => {
      console.log('[DEBUG] Processing file:', file.name, file.size, file.type);
      
      // Validate each file
      const validation = imageService.validateImage(file);
      if (!validation.valid) {
        console.log('[DEBUG] File validation failed:', validation.error);
        errorMessages.push(`${file.name}: ${validation.error}`);
        return;
      }

      // Check if file already exists
      const existingFile = formData.images.find(img => img.file.name === file.name && img.file.size === file.size);
      if (existingFile) {
        console.log('[DEBUG] File already exists:', file.name);
        errorMessages.push(`${file.name}: File already added`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = imageService.createPreviewUrl(file);
      
      console.log('[DEBUG] Adding valid file:', file.name, 'with id:', id);
      validFiles.push({
        file,
        previewUrl,
        id
      });
    });

    console.log('[DEBUG] Valid files to add:', validFiles.length);
    console.log('[DEBUG] Error messages:', errorMessages);

    if (errorMessages.length > 0) {
      setUploadError(errorMessages.join('; '));
    } else {
      setUploadError(null);
    }

    if (validFiles.length > 0) {
      console.log('[DEBUG] Calling onChange with new images');
      const newFormData = {
        ...formData,
        images: [...formData.images, ...validFiles]
      };
      console.log('[DEBUG] New images array will have', newFormData.images.length, 'items');
      onChange(newFormData);
    } else {
      console.log('[DEBUG] No valid files to add');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('[DEBUG] File input changed, files:', files?.length || 0);
    console.log('[DEBUG] Event target:', e.target);
    console.log('[DEBUG] Current formData.images length:', formData.images.length);
    
    if (files && files.length > 0) {
      // Create a copy of the FileList to avoid it being cleared
      const filesCopy = Array.from(files);
      console.log('[DEBUG] Files copy created:', filesCopy.length);
      
      // Process files immediately
      processFiles(filesCopy);
    }
    
    // Always reset the input value to allow selecting the same file again
    e.target.value = '';
    console.log('[DEBUG] File input reset immediately');
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
    const imageToRemove = formData.images.find(img => img.id === imageId);
    if (imageToRemove) {
      imageService.revokePreviewUrl(imageToRemove.previewUrl);
    }
    
    const updatedImages = formData.images.filter(img => img.id !== imageId);
    onChange({
      ...formData,
      images: updatedImages
    });
    setUploadError(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gym Images</h3>
        <p className="text-sm text-gray-600">Add high-quality photos of your gym to attract more members. You can upload up to {maxImages} images.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">5</div>
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="space-y-4">
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
            key={`file-input-${formData.images.length}`}
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

        {/* Display existing images */}
        {formData.images.length > 0 && (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((img) => (
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📸 Image Guidelines:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a high-quality photo that showcases your gym's best features</li>
          <li>• Ensure good lighting and clear visibility of equipment/space</li>
          <li>• Avoid cluttered or poorly lit images</li>
          <li>• Consider showing people using the gym (with permission)</li>
        </ul>
      </div>
    </div>
  );
};

export default StepImageUpload;

