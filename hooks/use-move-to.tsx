import { create } from "zustand";

type MoveToData = {
  id: string;
  type: "page" | "folder";
  parentId?: string;
};

type MoveToStore = {
  data?: MoveToData;
  onOpen: (data: MoveToData) => void;
  onClose: () => void;
};

export const useMoveTo = create<MoveToStore>((set) => ({
  data: undefined,
  onOpen: (data) => set({ data }),
  onClose: () => set({ data: undefined }),
}));
