import React, { useState } from 'react';
import { Copy, Check, Instagram, Hash, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { InstagramPostData } from '@/lib/gemini';

interface GeneratedContentProps {
  content: InstagramPostData;
  isGenerating: boolean;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ content, isGenerating }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success(`${section} copied to clipboard!`);
      
      setTimeout(() => {
        setCopiedSection(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyAll = async () => {
    const fullPost = `${content.title}\n\n${content.caption}\n\n${content.hashtags.map(tag => `#${tag}`).join(' ')}`;
    await copyToClipboard(fullPost, 'Full post');
  };

  if (isGenerating) {
    return (
      <Card className="p-8 bg-gradient-card shadow-card border-0">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-instagram rounded-full flex items-center justify-center animate-pulse">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Creating your Instagram post...</h3>
            <p className="text-muted-foreground">
              AI is analyzing your image and crafting the perfect content
            </p>
          </div>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!content.title && !content.caption && !content.hashtags) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Your Instagram Post</h3>
        <Button
          variant="instagram"
          onClick={copyAll}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy All
        </Button>
      </div>

      {/* Title Section */}
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Type className="w-5 h-5 text-primary" />
              <Badge variant="secondary">Title</Badge>
            </div>
            <h4 className="text-lg font-semibold text-foreground">
              {content.title}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(content.title, 'Title')}
            className={cn(
              "transition-all duration-200",
              copiedSection === 'Title' && "text-green-600"
            )}
          >
            {copiedSection === 'Title' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Caption Section */}
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Instagram className="w-5 h-5 text-primary" />
              <Badge variant="secondary">Caption</Badge>
            </div>
            <p className="text-foreground leading-relaxed">
              {content.caption}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(content.caption, 'Caption')}
            className={cn(
              "transition-all duration-200",
              copiedSection === 'Caption' && "text-green-600"
            )}
          >
            {copiedSection === 'Caption' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Hashtags Section */}
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-primary" />
              <Badge variant="secondary">Hashtags</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {content.hashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                  onClick={() => copyToClipboard(`#${hashtag}`, `Hashtag #${hashtag}`)}
                >
                  #{hashtag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(content.hashtags.map(tag => `#${tag}`).join(' '), 'Hashtags')}
            className={cn(
              "transition-all duration-200",
              copiedSection === 'Hashtags' && "text-green-600"
            )}
          >
            {copiedSection === 'Hashtags' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GeneratedContent;