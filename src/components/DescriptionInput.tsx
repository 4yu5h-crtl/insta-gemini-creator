import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Type, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DescriptionInputProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({
  description,
  onDescriptionChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            onDescriptionChange(description + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          toast.error('Speech recognition error. Please try again.');
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [description, onDescriptionChange]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Recording started. Speak now...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped.');
    }
  };

  const clearDescription = () => {
    onDescriptionChange('');
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Describe your image</h3>
          <div className="flex items-center space-x-2">
            <Badge variant={inputMode === 'text' ? 'default' : 'secondary'}>
              <Type className="w-3 h-3 mr-1" />
              Text
            </Badge>
            <Badge variant={inputMode === 'voice' ? 'default' : 'secondary'}>
              <Mic className="w-3 h-3 mr-1" />
              Voice
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe what's in your image, the mood, setting, or any context you'd like to include in your Instagram post..."
            className="min-h-[120px] resize-none shadow-input border-0 bg-background/50 backdrop-blur-sm"
            onClick={() => setInputMode('text')}
          />
          
          <div className="flex items-center space-x-3">
            {recognitionRef.current && (
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "transition-all duration-300",
                  isRecording && "animate-pulse"
                )}
                disabled={!recognitionRef.current}
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            )}
            
            {description && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDescription}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
            
            <div className="flex-1 text-right">
              <span className="text-xs text-muted-foreground">
                {description.length} characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default DescriptionInput;