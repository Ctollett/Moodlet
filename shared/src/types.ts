// Shared TypeScript types between client and server
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

export type Board = {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Element = {
  id: string;
  boardId: string;
  type: "note" | "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type Collaborator = {
  id: string;
  userId: string;
  boardId: string;
  role: "owner" | "view" | "edit";
  createdAt: Date;
  updatedAt: Date;
};
