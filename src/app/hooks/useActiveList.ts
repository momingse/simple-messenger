import { create } from "zustand";

interface ActiveListStore {
  members: string[];
  add: (member: string) => void;
  remove: (member: string) => void;
  set: (members: string[]) => void;
}

const useActiveList = create<ActiveListStore>((set) => ({
  members: [],
  add: (member) => set((state) => ({ members: [...state.members, member] })),
  remove: (member) =>
    set((state) => ({ members: state.members.filter((m) => m !== member) })),
  set: (members) => set({ members }),
}));

export default useActiveList;
