import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSection, GalleryItem, MusicItem, VideoItem } from './types';

interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  activeSection: AppSection;
  backgroundMode: 'dark' | 'light' | 'abstract';
  galleryImages: GalleryItem[];
  musicPlaylist: MusicItem[];
  videoPlaylist: VideoItem[];
  setIsLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setActiveSection: (section: AppSection) => void;
  toggleBackgroundMode: () => void;
  addGalleryImage: (img: GalleryItem) => void;
  removeGalleryImage: (id: number) => void;
  addMusicTrack: (track: MusicItem) => void;
  removeMusicTrack: (id: string) => void;
  addVideoTrack: (video: VideoItem) => void;
  removeVideoTrack: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: true,
      isAuthenticated: false,
      activeSection: AppSection.HOME,
      backgroundMode: 'dark',
      galleryImages: [],
      musicPlaylist: [],
      videoPlaylist: [],
      setIsLoading: (loading) => set({ isLoading: loading }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setActiveSection: (section) => set({ activeSection: section }),
      toggleBackgroundMode: () => set((state) => ({
        backgroundMode: state.backgroundMode === 'dark' ? 'abstract' : state.backgroundMode === 'abstract' ? 'light' : 'dark'
      })),
      addGalleryImage: (img) => set((state) => ({ galleryImages: [...state.galleryImages, img] })),
      removeGalleryImage: (id) => set((state) => ({ galleryImages: state.galleryImages.filter(i => i.id !== id) })),
      addMusicTrack: (track) => set((state) => ({ musicPlaylist: [track, ...state.musicPlaylist] })),
      removeMusicTrack: (id) => set((state) => ({ musicPlaylist: state.musicPlaylist.filter(t => t.id !== id) })),
      addVideoTrack: (video) => set((state) => ({ videoPlaylist: [video, ...state.videoPlaylist] })),
      removeVideoTrack: (id) => set((state) => ({ videoPlaylist: state.videoPlaylist.filter(v => v.id !== id) })),
    }),
    {
      name: 'portfolio-storage',
      version: 1, // Bump version to reset storage and prevent schema mismatch crashes
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        galleryImages: state.galleryImages,
        backgroundMode: state.backgroundMode,
        musicPlaylist: state.musicPlaylist,
        videoPlaylist: state.videoPlaylist
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.isAuthenticated) {
          state.setIsLoading(false);
        }
      }
    }
  )
);
