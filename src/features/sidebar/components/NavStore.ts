import { create } from 'zustand'

interface NavStore {
  activeView: string
  setActiveView: (view: string) => void
  sidebarExpanded: boolean
  setSidebarExpanded: (expanded: boolean) => void
}

export const useNavStore = create<NavStore>((set) => ({
  activeView: 'canvas',
  setActiveView: (view) => set({ activeView: view }),
  sidebarExpanded: false,
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
}))
