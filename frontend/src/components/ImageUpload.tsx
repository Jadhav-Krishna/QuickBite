import { useState, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onDelete?: () => Promise<void>;
  maxSizeMB?: number;
  aspectRatio?: string;
  label?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  maxSizeMB = 10,
  aspectRatio = '16/9',
  label = 'Upload Image',
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF, WebP)';
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Image size must be less than ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      const uploadedUrl = await onUpload(file);
      setImageUrl(uploadedUrl);
      setPreview(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setDeleting(true);
      await onDelete();
      setImageUrl(undefined);
      setPreview(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = preview || imageUrl;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700">{label}</label>

      {/* Image Preview/Upload Area */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-red-500"
        style={{ aspectRatio }}
      >
        {displayImage ? (
          <>
            {/* Image Display */}
            <img
              src={displayImage}
              alt="Preview"
              className="h-full w-full object-cover"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deleting}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                <Upload size={16} />
                Change
              </button>
              {onDelete && imageUrl && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={uploading || deleting}
                  className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
                >
                  <X size={16} />
                  Remove
                </button>
              )}
            </div>

            {/* Loading Overlay */}
            {(uploading || deleting) && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
                <p className="text-white font-bold text-sm">
                  {uploading ? 'Uploading...' : 'Deleting...'}
                </p>
                <div className="mt-3 w-48 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full animate-progress" />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Upload Prompt */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-full w-full flex flex-col items-center justify-center gap-3 p-6 transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                  <p className="text-sm font-bold text-gray-700">Uploading...</p>
                  <div className="w-48 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full animate-progress" />
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-red-50 p-4">
                    <ImageIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF, WebP (Max {maxSizeMB}MB)
                    </p>
                  </div>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Upload Failed</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Info Message */}
      <p className="text-xs text-gray-500">
        Recommended: High-quality images with {aspectRatio.replace('/', ':')} aspect ratio
      </p>
    </div>
  );
}
