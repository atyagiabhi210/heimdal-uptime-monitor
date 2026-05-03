import { create } from "zustand";

interface MacbookStoreType {
  color: string;
  setColor: (color: string) => void;
  scale: number;
  setScale: (scale: number) => void;
  texture: string;
  setTexture: (texture: string) => void;
  reset: () => void;
}

export const useMacbookStore = create<MacbookStoreType>((set) => ({
  color: "#adb5bd",
  setColor: (color: string) => set({ color }),
  scale: 0.08,
  setScale: (scale: number) => set({ scale }),
  texture: "/videos/feature-1.mp4",
  setTexture: (texture: string) => set({ texture }),
  reset: () =>
    set({ color: "#adb5bd", scale: 0.08, texture: "/videos/feature-1.mp4" }),
}));
