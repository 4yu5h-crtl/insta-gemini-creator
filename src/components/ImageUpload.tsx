import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Scissors, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemoveImage: () => void;
  isProcessingImage?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  selectedImage, 
  onRemoveImage,
  isProcessingImage = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [removeBackgroundEnabled, setRemoveBackgroundEnabled] = useState(true);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  const processImage = async (file: File) => {
    if (removeBackgroundEnabled) {
      setIsRemovingBackground(true);
      toast.success('Processing image to focus on your product...');
      
      try {
        const imageElement = await loadImage(file);
        const processedBlob = await removeBackground(imageElement);
        const processedFile = new File([processedBlob], file.name, { type: 'image/png' });
        
        onImageSelect(processedFile);
        
        // Create preview for processed image
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(processedFile);
        
        toast.success('Background removed! Your product is now the focus.');
      } catch (error) {
        console.error('Background removal failed:', error);
        toast.error('Background removal failed. Using original image.');
        
        // Fallback to original image
        onImageSelect(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsRemovingBackground(false);
      }
    } else {
      // Use original image
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processImage(file);
    }
  }, [removeBackgroundEnabled, onImageSelect]);

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
      <div className="space-y-4">
        {/* Product Focus Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Scissors className="w-5 h-5 text-primary" />
            <div>
              <Label htmlFor="remove-bg" className="text-sm font-medium">
                Product Focus Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Remove background to highlight your craft
              </p>
            </div>
          </div>
          <Switch
            id="remove-bg"
            checked={removeBackgroundEnabled}
            onCheckedChange={setRemoveBackgroundEnabled}
            disabled={isRemovingBackground || isProcessingImage}
          />
        </div>

        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-card shadow-card">
            {(isRemovingBackground || isProcessingImage) && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-3 text-white">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium">
                    {isRemovingBackground ? 'Removing background...' : 'Processing...'}
                  </p>
                </div>
              </div>
            )}
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
                disabled={isRemovingBackground || isProcessingImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground text-center">
            {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(1)} MB)
            {removeBackgroundEnabled && (
              <span className="block text-xs text-primary mt-1">
                ✓ Background removal enabled - focusing on your product
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Product Focus Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Scissors className="w-5 h-5 text-primary" />
          <div>
            <Label htmlFor="remove-bg-upload" className="text-sm font-medium">
              Product Focus Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically remove background to highlight your craft
            </p>
          </div>
        </div>
        <Switch
          id="remove-bg-upload"
          checked={removeBackgroundEnabled}
          onCheckedChange={setRemoveBackgroundEnabled}
        />
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ease-smooth",
          "bg-gradient-subtle shadow-input hover:shadow-card",
          isDragActive 
            ? "border-primary bg-primary/5 scale-105" 
            : "border-border hover:border-primary/50",
          isRemovingBackground && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} disabled={isRemovingBackground} />
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
            isDragActive 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-muted text-muted-foreground",
            isRemovingBackground && "animate-pulse"
          )}>
            {isRemovingBackground ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isDragActive ? (
              <ImageIcon className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isRemovingBackground 
                ? "Processing your product image..." 
                : isDragActive 
                ? "Drop your product image here" 
                : "Upload your product image"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {isRemovingBackground 
                ? "Removing background to focus on your craft..."
                : "Drag & drop or click to select • JPG, PNG, GIF up to 10MB"
              }
            </p>
            {removeBackgroundEnabled && !isRemovingBackground && (
              <p className="text-xs text-primary font-medium">
                ✓ Background will be automatically removed
              </p>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            disabled={isRemovingBackground}
          >
            {isRemovingBackground ? "Processing..." : "Choose File"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;