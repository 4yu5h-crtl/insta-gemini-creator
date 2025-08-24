import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemoveImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  selectedImage, 
  onRemoveImage 
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemove = () => {
    onRemoveImage();
    setPreview(null);
  };

  if (selectedImage && preview) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-xl bg-gradient-card shadow-card">
          <img 
            src={preview} 
            alt="Selected" 
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="bg-white/20 hover:bg-red-500 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 text-sm text-muted-foreground text-center">
          {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(1)} MB)
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ease-smooth",
        "bg-gradient-subtle shadow-input hover:shadow-card",
        isDragActive 
          ? "border-primary bg-primary/5 scale-105" 
          : "border-border hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
          isDragActive 
            ? "bg-primary text-primary-foreground scale-110" 
            : "bg-muted text-muted-foreground"
        )}>
          {isDragActive ? (
            <ImageIcon className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? "Drop your image here" : "Upload an image"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to select • JPG, PNG, GIF up to 10MB
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
        >
          Choose File
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;