import { Request, Response } from "express";

import { prisma } from "../prisma/client.js";

/**
 * Create a new board
 * @param req - Express request with body: { name, description, }
 * @param res - Express response with { user, token }
 *
 */

export const getBoards = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  try {
    const boards = await prisma.board.findMany({
      where: {
        ownerId: userId,
      },
    });

    return res.status(200).json({
      message: "Boards fetched successfully",
      boards: boards,
    });
  } catch {
    return res.status(500).json({
      error: "Failed to fetch boards",
    });
  }
};

export const createBoard = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user!.userId;

  try {
    const newBoard = await prisma.board.create({
      data: {
        name: name,
        description: description,
        ownerId: userId,
      },
    });

    return res.status(201).json({
      message: "Board created successfully",
      board: {
        id: newBoard.id,
        name: newBoard.name,
        description: newBoard.description,
        ownerId: newBoard.ownerId,
      },
    });
  } catch {
    return res.status(500).json({
      error: "Failed to create new board",
    });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  const boardId = req.params.id;
  const userId = req.user!.userId;

  try {
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      return res.status(404).json({
        error: "No board found",
      });
    } else if (board.ownerId != userId) {
      return res.status(403).json({
        error: "Board does not belong to user",
      });
    }
    const deletedBoard = await prisma.board.delete({
      where: {
        id: boardId,
      },
    });

    return res.status(200).json({
      message: "Board successfully deleted",
      board: {
        id: deletedBoard.id,
        ownerId: userId,
      },
    });
  } catch (error) {
    console.error("Registration error: ", error);
    return res.status(500).json({
      error: "Registration failed",
    });
  }
};
