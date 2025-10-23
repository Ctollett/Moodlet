import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

/**
 * Welcome/Landing Page
 * Shows login and register options to unauthenticated users
 */
const Welcome = () => {
  // TODO: Add state for modal visibility
  // TODO: Implement modal for auth forms

  return (
    <div className="welcome-page">
      <h1>Welcome to Moodlet</h1>

      {/* Temporary: Showing RegisterForm directly for testing */}
      <RegisterForm />

      {/* TODO: Add buttons to open login/register modals */}
      <LoginForm />
      {/* TODO: Add AuthModal component */}
    </div>
  );
};

export default Welcome;
