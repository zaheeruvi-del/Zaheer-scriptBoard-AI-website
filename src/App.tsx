import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScriptInput } from './components/ScriptInput';
import { StoryboardView } from './components/StoryboardView';
import { StoryboardFrame, StoryboardData } from './types';
import { parseScript, generateFrameImage, generateVideo } from './services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(null);

  const handleProcessScript = async (script: string) => {
    setIsLoading(true);
    try {
      const parsed = await parseScript(script);
      
      const frames: StoryboardFrame[] = parsed.frames.map((f, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        sceneNumber: f.sceneNumber || i + 1,
        description: f.description || '',
        imagePrompt: f.imagePrompt || '',
        dialog: f.dialog,
        status: 'pending' as const,
      }));

      setStoryboard({
        title: parsed.title,
        script,
        frames,
      });

      // Start individual frame generations
      processFramesSequentially(frames);
    } catch (error) {
      console.error('Error processing script:', error);
      alert('Failed to process script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processFramesSequentially = async (frames: StoryboardFrame[]) => {
    for (const frame of frames) {
      updateFrameStatus(frame.id, 'generating');
      try {
        const imageUrl = await generateFrameImage(frame.imagePrompt);
        setStoryboard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            frames: prev.frames.map(f => 
              f.id === frame.id ? { ...f, imageUrl, status: 'completed' } : f
            ),
          };
        });
      } catch (error) {
        console.error(`Error generating image for frame ${frame.id}:`, error);
        updateFrameStatus(frame.id, 'error');
      }
    }
  };

  const updateFrameStatus = (id: string, status: StoryboardFrame['status']) => {
    setStoryboard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        frames: prev.frames.map(f => f.id === id ? { ...f, status } : f),
      };
    });
  };

  const handleRefreshFrame = async (id: string) => {
    const frame = storyboard?.frames.find(f => f.id === id);
    if (!frame) return;

    updateFrameStatus(id, 'generating');
    try {
      const imageUrl = await generateFrameImage(frame.imagePrompt);
      setStoryboard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          frames: prev.frames.map(f => 
            f.id === id ? { ...f, imageUrl, status: 'completed' } : f
          ),
        };
      });
    } catch (error) {
      updateFrameStatus(id, 'error');
    }
  };

  const handleAnimateFrame = async (id: string) => {
    const frame = storyboard?.frames.find(f => f.id === id);
    if (!frame || !frame.imageUrl) return;

    // Check for API key for Veo
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Skill says: assume selection was successful and proceed
      }
    }

    setStoryboard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        frames: prev.frames.map(f => 
          f.id === id ? { ...f, videoStatus: 'generating' } : f
        ),
      };
    });

    try {
      const videoUrl = await generateVideo(frame.imagePrompt, frame.imageUrl);
      setStoryboard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          frames: prev.frames.map(f => 
            f.id === id ? { ...f, videoUrl, videoStatus: 'completed' } : f
          ),
        };
      });
    } catch (error) {
      console.error('Error generating video:', error);
      setStoryboard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          frames: prev.frames.map(f => 
            f.id === id ? { ...f, videoStatus: 'error' } : f
          ),
        };
      });
    }
  };

  const handleBack = () => {
    if (confirm('Are you sure? Your current storyboard progress will be lost.')) {
      setStoryboard(null);
    }
  };

  return (
    <div className="relative min-h-screen px-6 py-12 md:py-24 overflow-x-hidden">
      <div className="atmosphere" />
      
      <main className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {!storyboard ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ScriptInput 
                onProcess={handleProcessScript} 
                isLoading={isLoading} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <StoryboardView 
                title={storyboard.title}
                frames={storyboard.frames}
                onBack={handleBack}
                onRefreshFrame={handleRefreshFrame}
                onAnimateFrame={handleAnimateFrame}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 mt-24 text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
          Powered by Gemini 3 & Gemini 2.5 Image • Creative Labs 2026
        </p>
      </footer>
    </div>
  );
}

