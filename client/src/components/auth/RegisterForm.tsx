import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "shared";
import { ZodError } from "zod";

import { registerUser } from "../../services/authService";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const userData = {
      name,
      email,
      password,
      profileAvatar: avatar || undefined,
    };

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const validatedData = registerSchema.parse(userData);
      await registerUser(validatedData);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof ZodError) {
        setError(error.issues[0].message);
      } else if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error);
      } else {
        setError("Could not complete form as submitted.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
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
      <div>
        <label htmlFor="password">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="avatar">Profile Image:</label>
        <input
          type="file"
          id="profileImage"
          name="image/*"
          onChange={(e) => setAvatar(e.target.value)}
        />
      </div>
      <div className="button-div">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default RegisterForm;
