
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateDemoAudio } from '../services/gemini';

export interface MusicResult {
  id: string;
  name: string;
  desc: string;
  timestamp: string;
  buffer: AudioBuffer;
}

export const useMusicStudio = () => {
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  // Input states
  const [songName, setSongName] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [selectedModel, setSelectedModel] = useState('V-Sky 2.5');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'current' | 'library'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expanding, setExpanding] = useState<'desc' | 'lyrics' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  
  // Data states
  const [results, setResults] = useState<MusicResult[]>([]);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setActiveAudioId(null);
  }, []);

  const playBuffer = useCallback((buffer: AudioBuffer, id: string) => {
    if (activeAudioId === id && isPlaying) {
      stopPlayback();
      return;
    }
    
    stopPlayback();
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    
    const source = audioCtxRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current!.destination);
    source.onended = () => {
      setIsPlaying(false);
      setActiveAudioId(null);
    };
    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    setActiveAudioId(id);
  }, [activeAudioId, isPlaying, stopPlayback]);

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    
    setIsGenerating(true);
    stopPlayback();
    
    try {
      const prompt = `Create a high-fidelity track. Title: ${songName}. Style: ${description}. Lyrics: ${lyrics}. Instrumental: ${isInstrumental}`;
      const buffer = await generateDemoAudio(prompt, 'Kore'); 
      
      if (buffer) {
        useCredits(2500);
        const newSong: MusicResult = { 
          id: Date.now().toString(), 
          name: songName || 'Untitled Track', 
          desc: description,
          buffer: buffer,
          timestamp: new Date().toLocaleTimeString()
        };
        setResults(prev => [newSong, ...prev]);
        setActiveTab('current');
        playBuffer(buffer, newSong.id);
      }
    } catch (error) {
      console.error("Music Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    songName, setSongName,
    description, setDescription,
    lyrics, setLyrics,
    isInstrumental, setIsInstrumental,
    selectedModel, setSelectedModel,
    activeTab, setActiveTab,
    isGenerating,
    expanding, setExpanding,
    isPlaying, activeAudioId,
    results, setResults,
    handleGenerate,
    playBuffer,
    stopPlayback
  };
};
