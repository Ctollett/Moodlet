// Board Types
import type { Collaborator } from "./collaborator.types";
import type { Element } from "./element.types";
// TODO: Define Board type (id, name, description, ownerId, createdAt, updatedAt)
export type Board = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

// TODO: Define CreateBoardRequest type (name, description?)
export type CreateBoardRequest = {
  name: string;
  description?: string;
};
// TODO: Define CreateBoardResponse type (board)
export type CreateBoardResponse = {
  board: Board;
};

// TODO: Define UpdateBoardRequest type (name?)
export type UpdateBoardRequest = {
  name?: string;
};
// TODO: Define UpdateBoardResponse type (board)
export type UpdateBoardResponse = {
  board: Board;
};

// TODO: Define GetBoardsResponse type (boards array)
export type GetBoardsResponse = {
  boards: Board[];
};

export type DeleteBoardResponse = {
  message: string;
};

export type GetBoardResponse = {
  // All the Board fields
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;

  // PLUS these arrays:
  elements: Element[]; // Array of elements (you'll define Element type later)
  collaborators: Collaborator[]; // Array of collaborators (you'll define this too)
};
