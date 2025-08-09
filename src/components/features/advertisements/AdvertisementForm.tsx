import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Plus, Calendar, Target, Eye } from 'lucide-react';
import { useAdvertisementStore } from '../../../stores/advertisementStore';
import { Advertisement, AdType, TargetAudience, CreateAdvertisementRequest } from '../../../models/Advertisement';

interface AdvertisementFormProps {
  advertisement?: Advertisement | null;
  onSave: () => void;
  onCancel: () => void;
}

export function AdvertisementForm({ advertisement, onSave, onCancel }: AdvertisementFormProps) {
  const { createAdvertisement, updateAdvertisement, creating, updating, error, uploadMedia, deleteMedia } = useAdvertisementStore();

  const [formData, setFormData] = useState<CreateAdvertisementRequest>({
    title: '',
    description: '',
    content: '',
    adType: 'banner',
    targetAudience: 'all',
    priority: 0,
    startDate: '',
    endDate: '',
    budget: undefined,
    media: [],
    targeting: [],
    schedules: []
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Helper function to format date for datetime-local input
  const formatDateTimeLocal = (dateString: string | undefined) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Format to YYYY-MM-DDTHH:mm format required by datetime-local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Initialize form with existing advertisement data
  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        description: advertisement.description || '',
        content: advertisement.content || '',
        adType: advertisement.adType,
        targetAudience: advertisement.targetAudience,
        priority: advertisement.priority,
        startDate: formatDateTimeLocal(advertisement.startDate),
        endDate: formatDateTimeLocal(advertisement.endDate),
        budget: advertisement.budget,
        media: [],
        targeting: [],
        schedules: []
      });

      // Set existing media if available
      if (advertisement.media && advertisement.media.length > 0) {
        setExistingMedia(advertisement.media);
      } else {
        setExistingMedia([]);
      }
    } else {
      // Reset form for new advertisement
      setFormData({
        title: '',
        description: '',
        content: '',
        adType: 'banner',
        targetAudience: 'all',
        priority: 0,
        startDate: '',
        endDate: '',
        budget: undefined,
        media: [],
        targeting: [],
        schedules: []
      });
      setExistingMedia([]);
      setMediaFiles([]);
    }
  }, [advertisement]);


  const handleInputChange = (field: keyof CreateAdvertisementRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle deleting existing media
  const handleDeleteExistingMedia = async (mediaId: string, mediaIndex: number) => {
    if (!advertisement) return;

    if (window.confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
      try {
        // Call the delete media API
        if (deleteMedia) {
          await deleteMedia(advertisement.id, mediaId);
        }

        // Remove from local state
        setExistingMedia(prev => prev.filter((_, i) => i !== mediaIndex));
      } catch (error) {
        console.error('Error deleting media:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let savedAd: Advertisement | null = null;

      if (advertisement) {
        // Update existing advertisement - exclude media from form data since it's handled separately
        const { media, ...updateData } = formData;
        savedAd = await updateAdvertisement(advertisement.id, updateData);
      } else {
        // Create new advertisement
        savedAd = await createAdvertisement(formData);
      }

      if (savedAd && mediaFiles.length > 0) {
        // Upload media files
        setUploadingMedia(true);
        for (const file of mediaFiles) {
          const mediaType = file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('image/') && file.name.toLowerCase().includes('.gif') ? 'gif' : 'image';
          await uploadMedia(savedAd.id, file, mediaType, file.name);
        }
        setUploadingMedia(false);
      }

      onSave();
    } catch (error) {
      console.error('Error saving advertisement:', error);
    }
  };

  const isLoading = creating || updating || uploadingMedia;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Advertisements
        </button>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {advertisement ? 'Edit Advertisement' : 'Create New Advertisement'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter advertisement title..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the advertisement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertisement Type *
              </label>
              <select
                value={formData.adType}
                onChange={(e) => handleInputChange('adType', e.target.value as AdType)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="card">Card</option>
                <option value="video">Video</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience *
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value as TargetAudience)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="members">Members Only</option>
                <option value="gym_owners">Gym Owners</option>
                <option value="specific_gyms">Specific Gyms</option>
                <option value="location_based">Location Based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Content</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Advertisement Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the main content/copy for your advertisement..."
            />
            <p className="mt-1 text-xs text-gray-500">
              You can use HTML tags for formatting. This content will be displayed in the advertisement.
            </p>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Media</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images/Videos
              </label>
              <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">
                      Click to upload files
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleMediaUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    or drag and drop files here
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF, MP4 up to 10MB each
                </p>
              </div>
            </div>

            {/* Display existing media when editing */}
            {existingMedia.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Current Media
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    ({existingMedia.length} file{existingMedia.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingMedia.map((media, index) => (
                    <div key={media.id || index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {media.mediaType === 'image' || media.mediaType === 'gif' ? (
                          <img
                            src={media.mediaUrl}
                            alt={media.mediaAltText || 'Advertisement media'}
                            className="w-full h-full object-cover"
                          />
                        ) : media.mediaType === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <div className="text-center">
                              <div className="w-8 h-8 mx-auto mb-1 bg-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">▶</span>
                              </div>
                              <span className="text-xs text-gray-600">Video</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500">Media</span>
                          </div>
                        )}
                      </div>

                      {/* Delete button - only show on hover and when editing */}
                      {advertisement && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingMedia(media.id, index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Delete media file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {media.mediaAltText || media.fileName || `${media.mediaType} file`}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  💡 <strong>Tip:</strong> Hover over existing media files to delete them. Upload new files below to add more.
                </p>
              </div>
            )}

            {/* Preview uploaded files */}
            {mediaFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {existingMedia.length > 0 ? 'New Files to Upload' : 'Selected Files'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500">Video</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMediaFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduling</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!formData.title}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Preview
            </button>

            <button
              type="submit"
              disabled={isLoading || !formData.title}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploadingMedia ? 'Uploading Media...' : 'Saving...'}
                </div>
              ) : (
                advertisement ? 'Update Advertisement' : 'Create Advertisement'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Advertisement Preview
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    See how your ad will appear across different devices
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close Preview"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              {/* Device Preview Tabs */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-gray-100 rounded-xl p-1">
                  <button className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-lg shadow-sm">
                    📱 Mobile
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    💻 Desktop
                  </button>
                </div>
              </div>

              {/* Mobile Device Frame */}
              <div className="max-w-sm mx-auto">
                <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                  {/* Screen */}
                  <div className="bg-white rounded-[2rem] overflow-hidden min-h-[600px]">
                    {/* Status Bar */}
                    <div className="bg-gray-900 text-white px-6 py-2 text-xs flex justify-between items-center">
                      <span>9:41</span>
                      <span>🔋 100%</span>
                    </div>

                    {/* App Content */}
                    <div className="p-4 space-y-4">
                      {/* Ad Type Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full capitalize">
                          {formData.adType} Ad
                        </span>
                        <span className="text-xs text-gray-500">
                          Priority: {formData.priority}/10
                        </span>
                      </div>

                      {/* Advertisement Content */}
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        {/* Media Display */}
                        {(existingMedia.length > 0 || mediaFiles.length > 0) && (
                          <div className="relative">
                            {existingMedia.length > 0 && (existingMedia[0].mediaType === 'image' || existingMedia[0].mediaType === 'gif') ? (
                              <img
                                src={existingMedia[0].mediaUrl}
                                alt={formData.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : mediaFiles.length > 0 && mediaFiles[0].type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(mediaFiles[0])}
                                alt={formData.title}
                                className="w-full h-48 object-cover"
                              />
                            ) : existingMedia.find(m => m.mediaType === 'video') || mediaFiles.find(f => f.type.startsWith('video/')) ? (
                              <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white text-2xl">▶</span>
                                  </div>
                                  <p className="text-white font-medium">Video Advertisement</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-500 text-xl">🖼️</span>
                                  </div>
                                  <p className="text-gray-500 text-sm">Media Preview</p>
                                </div>
                              </div>
                            )}

                            {/* Overlay for ad type */}
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs font-medium rounded backdrop-blur-sm">
                                {formData.adType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Ad Content */}
                        <div className="p-4">
                          <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {formData.title || 'Advertisement Title'}
                          </h2>

                          {formData.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {formData.description}
                            </p>
                          )}

                          {formData.content && (
                            <div
                              className="text-sm text-gray-700 mb-3 line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: formData.content }}
                            />
                          )}

                          {/* CTA Button */}
                          <div className="flex items-center justify-between">
                            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
                              Learn More
                            </button>

                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span>👁️ 0</span>
                              <span>👆 0</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Audience & Budget Info */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-600">Target:</span>
                            <span className="ml-1 font-medium text-gray-900 capitalize">
                              {formData.targetAudience.replace('_', ' ')}
                            </span>
                          </div>

                          {formData.budget && (
                            <div>
                              <span className="text-gray-600">Budget:</span>
                              <span className="ml-1 font-medium text-green-600">
                                ${typeof formData.budget === 'number' ? formData.budget.toFixed(2) : parseFloat(formData.budget || '0').toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {(formData.startDate || formData.endDate) && (
                          <div className="mt-2 text-xs text-gray-500">
                            📅 {formData.startDate && new Date(formData.startDate).toLocaleDateString()}
                            {formData.startDate && formData.endDate && ' - '}
                            {formData.endDate && new Date(formData.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Media Gallery Preview */}
                      {(existingMedia.length > 1 || mediaFiles.length > 1 || (existingMedia.length > 0 && mediaFiles.length > 0)) && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            📸 Media Gallery ({existingMedia.length + mediaFiles.length} files)
                          </h4>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {/* Existing Media Thumbnails */}
                            {existingMedia.map((media, index) => (
                              <div key={media.id || index} className="flex-shrink-0">
                                {media.mediaType === 'image' || media.mediaType === 'gif' ? (
                                  <img
                                    src={media.mediaUrl}
                                    alt={`Media ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-md"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMSAyNkgyN1YzMkgyMVYyNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI5IDI2SDM1VjMySDI5VjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzcgMjZINDNWMzJIMzdWMjZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                                    <span className="text-white text-xs">▶</span>
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* New Media Thumbnails */}
                            {mediaFiles.map((file, index) => (
                              <div key={`new-${index}`} className="flex-shrink-0">
                                {file.type.startsWith('image/') ? (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200 shadow-md"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-blue-200 shadow-md">
                                    <span className="text-white text-xs">▶</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Media State */}
                      {existingMedia.length === 0 && mediaFiles.length === 0 && (
                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                          <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">📷</span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{formData.title || 'Advertisement Title'}</h3>
                          {formData.description && (
                            <p className="text-sm text-gray-600 mb-3">{formData.description}</p>
                          )}
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Learn More
                          </button>
                          <p className="text-xs text-gray-400 mt-2">Add media to enhance your advertisement</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Preview (Optional) */}
              <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  💻 Desktop Preview
                </h4>

                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                  {(existingMedia.length > 0 || mediaFiles.length > 0) && (
                    <div className="relative h-64">
                      {existingMedia.length > 0 && (existingMedia[0].mediaType === 'image' || existingMedia[0].mediaType === 'gif') ? (
                        <img
                          src={existingMedia[0].mediaUrl}
                          alt={formData.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : mediaFiles.length > 0 && mediaFiles[0].type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(mediaFiles[0])}
                          alt={formData.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span className="text-3xl">🎬</span>
                            </div>
                            <p className="text-xl font-medium">Media Content</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
                        {formData.description && (
                          <p className="text-sm opacity-90">{formData.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {formData.content && (
                      <div
                        className="text-gray-700 mb-4"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
                        Get Started Now
                      </button>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👁️ 1,234 views</span>
                        <span>👆 56 clicks</span>
                        <span>⭐ {formData.priority} of 10 priority</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Advertisement Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{formData.adType}</div>
                    <div className="text-xs text-gray-500">Ad Type</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{formData.priority} / 10</div>
                    <div className="text-xs text-gray-500">Priority</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{existingMedia.length + mediaFiles.length}</div>
                    <div className="text-xs text-gray-500">Media Files</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {formData.budget ? `$${parseFloat(formData.budget.toString()).toFixed(0)}` : '$0'}
                    </div>
                    <div className="text-xs text-gray-500">Budget</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
