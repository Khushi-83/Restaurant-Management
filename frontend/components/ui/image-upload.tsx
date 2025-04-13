'use client';

import { useState } from 'react';
import { Button } from './button';
import { ImagePlus, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
}

export function ImageUpload({ onUploadComplete, onError }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onUploadComplete(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        className="relative"
        disabled={isUploading}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/*"
          aria-label="Upload image"
        />
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        <span className="ml-2">Upload Image</span>
      </Button>
    </div>
  );
} 