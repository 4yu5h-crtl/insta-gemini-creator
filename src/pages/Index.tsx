import React, { useState } from 'react';
import { Sparkles, Instagram, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';
import DescriptionInput from '@/components/DescriptionInput';
import GeneratedContent from '@/components/GeneratedContent';
import { generateInstagramPost, type InstagramPostData } from '@/lib/gemini';
import { toast } from 'sonner';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState<InstagramPostData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateInstagramPost(selectedImage, description);
      setGeneratedContent(content);
      toast.success('Instagram post generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedImage && description.trim() && !isGenerating;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-instagram">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Instagram className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Instagram Content Generator
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Upload an image, describe it with text or voice, and let AI create the perfect Instagram post with title, caption, and hashtags.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Upload Section */}
          <Card className="p-8 bg-gradient-card shadow-card border-0">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">1</span>
                </div>
                <h2 className="text-2xl font-bold">Upload Your Image</h2>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onRemoveImage={handleRemoveImage}
              />
            </div>
          </Card>

          {/* Description Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">2</span>
              </div>
              <h2 className="text-2xl font-bold">Add Description</h2>
            </div>
            <DescriptionInput
              description={description}
              onDescriptionChange={setDescription}
            />
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <Button
              variant="generate"
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="text-lg px-12 py-4 h-auto"
            >
              <Wand2 className="w-6 h-6 mr-3" />
              Generate Instagram Post
              <Sparkles className="w-6 h-6 ml-3" />
            </Button>
          </div>

          {/* Generated Content */}
          {(isGenerating || generatedContent) && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">3</span>
                </div>
                <h2 className="text-2xl font-bold">Your Generated Content</h2>
              </div>
              <GeneratedContent
                content={generatedContent || { title: '', caption: '', hashtags: [] }}
                isGenerating={isGenerating}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            Powered by Google Gemini AI • Create engaging Instagram content effortlessly
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;