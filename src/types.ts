export interface StoryboardFrame {
  id: string;
  sceneNumber: number;
  description: string;
  imagePrompt: string;
  dialog?: string;
  imageUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  videoStatus?: 'pending' | 'generating' | 'completed' | 'error';
}

export interface StoryboardData {
  title: string;
  script: string;
  frames: StoryboardFrame[];
}
