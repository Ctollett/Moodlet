import { createBoardSchema } from "shared";
import { z } from "zod";

import axiosInstance from "./axiosService";

type CreateBoardData = z.infer<typeof createBoardSchema>;

export const createBoard = async (boardData: CreateBoardData) => {
  try {
    const response = await axiosInstance.post("/boards", boardData);
    console.log("Board successfully created");

    return response.data;
  } catch (error) {
    console.error("Board failed to be created", error);
    throw error;
  }
};

export const deleteBoard = async (boardId: string) => {
  try {
    const response = await axiosInstance.delete(`/boards/${boardId}`);
    console.log("Board successfully deleted");

    return response.data;
  } catch (error) {
    console.error("Failed to delete board", error);
    throw error;
  }
};

export const getBoards = async () => {
  try {
    const response = await axiosInstance.get("/boards");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch boards", error);
    throw error;
  }
};
