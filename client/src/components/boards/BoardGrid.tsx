import { useEffect } from "react";

import { useBoardStore } from "../../stores/boardStore";

import BoardCard from "./BoardCard";

function BoardGrid() {
  const boards = useBoardStore((state) => state.boards);
  const loading = useBoardStore((state) => state.loading);
  const error = useBoardStore((state) => state.error);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (loading) return <p>loading boards...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="board-grid">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}

export default BoardGrid;
