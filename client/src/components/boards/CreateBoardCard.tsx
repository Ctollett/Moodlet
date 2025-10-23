import { useNavigate } from "react-router-dom";

import { useBoardStore } from "../../stores/boardStore";

function CreateBoard() {
  const createBoard = useBoardStore((state) => state.createBoard);
  const navigate = useNavigate();

  const handleClick = async () => {
    const newBoard = await createBoard({
      name: "Untitled Board",
      description: "",
    });

    if (newBoard) {
      navigate(`/board/${newBoard.id}`);
    } else {
      console.log("No boards created");
    }
  };

  return (
    <div className="create-board-card">
      <button onClick={handleClick}>Create Board</button>
    </div>
  );
}

export default CreateBoard;
