import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "shared";
import { ZodError } from "zod";

import { loginUser } from "../../services/authService";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const userData = {
      email,
      password,
    };

    try {
      const validatedData = loginSchema.parse(userData);
      await loginUser(validatedData);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof ZodError) {
        setError(error.issues[0].message);
      } else if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error);
      } else {
        setError("Could not complete form as submitted");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="button-div">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default LoginForm;
