import type { Board } from "shared";
import { create } from "zustand";

import * as boardService from "../services/boardService";

interface BoardState {
  boards: Board[];
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  createBoard: (boardData: { name: string; description?: string }) => Promise<Board | undefined>;
  deleteBoard: (boardId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true });
    try {
      const data = await boardService.getBoards();
      set({ boards: data.boards, loading: false, error: null });
    } catch {
      set({ error: "Failed to fetch boards", loading: false });
    }
  },

  createBoard: async (boardData: { name: string; description?: string }) => {
    set({ loading: true });
    try {
      const data = await boardService.createBoard(boardData);
      set({ boards: [...get().boards, data.board], loading: false, error: null });
      return data.board;
    } catch {
      set({ error: "Failed to create board", loading: false });
      return undefined;
    }
  },

  deleteBoard: async (boardId: string) => {
    set({ loading: true });
    try {
      await boardService.deleteBoard(boardId);
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== boardId),
        loading: false,
        error: null,
      }));
    } catch {
      set({ error: "Failed to delete board", loading: false });
    }
  },
}));
