import React, { useState } from "react";
import type { Board } from "shared";

import DeleteModal from "./DeleteModal";

interface BoardCardProps {
  board: Board;
}

function BoardCard({ board }: BoardCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="board-card">
        <h3>{board.name}</h3>
        <p>{board.description ?? " "}</p>
        <button onClick={() => setIsModalOpen(true)} className="delete-btn">
          Delete
        </button>
      </div>

      <DeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} board={board} />
    </>
  );
}

export default BoardCard;
