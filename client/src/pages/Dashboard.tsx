import BoardGrid from "../components/boards/BoardGrid";
import CreateBoard from "../components/boards/CreateBoardCard";

/**
 * Dashboard Page
 * Main application page for authenticated users
 * TODO: This should be a protected route
 */
const Dashboard = () => {
  // TODO: Add logout functionality
  // TODO: Add main app features (mood tracking, etc.)

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <CreateBoard />
      <BoardGrid />
    </div>
  );
};

export default Dashboard;
