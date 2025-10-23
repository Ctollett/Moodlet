import { jwtDecode } from "jwt-decode";
import { registerSchema, loginSchema } from "shared";
import { z } from "zod";

import axiosInstance from "./axiosService";

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

interface JwtPayload {
  userId: string;
  exp: number;
  iat?: number;
}

export const registerUser = async (userData: RegisterData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    const { token } = response.data;

    localStorage.setItem("authToken", token);
    console.log("User registered successfully and token stored");

    return response.data;
  } catch (error) {
    console.error("Registration Failed", error);
    throw error;
  }
};

export const loginUser = async (userData: LoginData) => {
  try {
    const response = await axiosInstance.post("/auth/login", userData);
    const { token } = response.data;

    localStorage.setItem("authToken", token);
    console.log("User logged in successfully and token stored");

    return response.data;
  } catch (error) {
    console.error("Login Failed", error);
    throw error;
  }
};

export const logout = async () => {
  localStorage.removeItem("authToken");
  console.log("user logged out, token removed");
};

export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const isAuthenticated = (): boolean => {
  const token = getToken();

  if (token) {
    const payload = jwtDecode<JwtPayload>(token);
    const exp = payload.exp;
    const currentTime = Date.now() / 1000;
    if (exp < currentTime) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};
