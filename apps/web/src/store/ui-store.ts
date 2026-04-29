import { create } from 'zustand';

interface UIState {
  activityFeedOpen: boolean;
  toggleActivityFeed: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activityFeedOpen: true,
  toggleActivityFeed: () => set((s) => ({ activityFeedOpen: !s.activityFeedOpen })),
}));
