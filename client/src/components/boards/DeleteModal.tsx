import type { Board } from "shared";

import { useBoardStore } from "../../stores/boardStore";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
}

function DeleteModal({ isOpen, onClose, board }: DeleteModalProps) {
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const loading = useBoardStore((state) => state.loading);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    await deleteBoard(board.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>Are you sure you would like to delete {board.name}?</p>
        <button onClick={handleConfirmDelete} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </button>
        <button onClick={onClose}>Go Back</button>
      </div>
    </div>
  );
}

export default DeleteModal;
