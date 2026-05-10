import { motion } from 'motion/react';
import { Download, ChevronLeft, RefreshCcw } from 'lucide-react';
import { StoryboardFrame } from '../types';

interface StoryboardViewProps {
  title: string;
  frames: StoryboardFrame[];
  onBack: () => void;
  onRefreshFrame: (id: string) => void;
  onAnimateFrame: (id: string) => void;
}

export function StoryboardView({ title, frames, onBack, onRefreshFrame, onAnimateFrame }: StoryboardViewProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Script
          </button>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white">
            {title} <span className="text-brand-orange italic font-serif">Sequence</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {frames.map((frame, index) => (
          <motion.div
            key={frame.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group"
          >
            <div className="aspect-video relative bg-white/5 flex items-center justify-center overflow-hidden">
              {frame.status === 'generating' || frame.status === 'pending' ? (
                <div className="flex flex-col items-center gap-4 text-white/30">
                  <div className="w-12 h-12 border-2 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                  <span className="text-xs uppercase tracking-widest font-medium">Developing Frame {index + 1}...</span>
                </div>
              ) : frame.status === 'error' ? (
                <div className="text-center p-8 text-red-400">
                  <p className="text-sm">Failed to generate image</p>
                  <button 
                    onClick={() => onRefreshFrame(frame.id)}
                    className="mt-4 text-xs flex items-center gap-2 mx-auto hover:text-white transition-colors"
                  >
                    <RefreshCcw size={14} /> Retry
                  </button>
                </div>
              ) : (
                <>
                  {frame.videoUrl ? (
                    <video 
                      src={frame.videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={frame.imageUrl} 
                      alt={frame.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {frame.videoStatus === 'generating' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                      <div className="w-10 h-10 border-2 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                      <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold">Rendering Animation...</span>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-30">
                    {!frame.videoUrl && frame.videoStatus !== 'generating' && (
                      <button 
                        onClick={() => onAnimateFrame(frame.id)}
                        className="p-2 bg-brand-orange rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                        title="Animate with Veo"
                      >
                        <RefreshCcw size={16} className="rotate-90" />
                      </button>
                    )}
                    <button 
                      onClick={() => onRefreshFrame(frame.id)}
                      className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white"
                      title="Regenerate Image"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                </>
              )}
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-30">
                <span className="text-[10px] font-bold tracking-tighter text-white/80">SHOT {String(index + 1).padStart(2, '0')}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-brand-orange font-bold">Visual</label>
                <p className="text-sm text-white/80 line-clamp-2 italic font-serif">"{frame.description}"</p>
              </div>

              {frame.dialog && (
                <div className="space-y-1 border-t border-white/5 pt-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Audio/Cue</label>
                  <p className="text-sm text-white/60 font-mono italic">{frame.dialog}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
