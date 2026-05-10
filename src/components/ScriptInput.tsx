import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ScriptInputProps {
  onProcess: (script: string) => void;
  isLoading: boolean;
}

export function ScriptInput({ onProcess, isLoading }: ScriptInputProps) {
  const [script, setScript] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setScript(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (script.trim()) {
      onProcess(script);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
          Direct your <span className="text-brand-orange italic font-serif">Vision</span>
        </h1>
        <p className="text-white/40 text-lg font-light max-w-lg mx-auto">
          Upload your script and let our AI-powered cinematographer visualize your scenes into a sequence of cinematic storyboard frames.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest text-white/40 font-semibold px-1">
              Script Content
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-2 text-brand-orange hover:text-white transition-colors"
            >
              <Upload size={14} />
              Upload .txt / .pdf
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              className="hidden" 
              accept=".txt"
            />
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="INT. COFFEE SHOP - DAY... OR PASTE YOUR STORY HERE"
            className="w-full h-64 cinematic-input resize-none custom-scrollbar"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !script.trim()}
            className={`btn-primary flex items-center gap-3 w-full sm:w-auto px-12 py-4 ${
              (isLoading || !script.trim()) ? 'opacity-50 cursor-not-allowed grayscale' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Script...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Storyboard
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-12 text-white/20 grayscale opacity-50">
        <div className="flex items-center gap-2"><FileText size={16} /> Scene Analysis</div>
        <div className="flex items-center gap-2"><Sparkles size={16} /> Visual Synthesis</div>
        <div className="flex items-center gap-2"><Upload size={16} /> Sequence Export</div>
      </div>
    </motion.div>
  );
}
