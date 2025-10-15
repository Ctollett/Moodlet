// Comment Types

// TODO: Define Comment type (id, content, userId, boardId, parentCommentId, resolved, createdAt, updatedAt)
export type Comment = {
  id: string;
  content: string;
  userId: string;
  boardId: string;
  parentCommentId: string | null;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// TODO: Define CreateCommentRequest type (content, parentCommentId?)
export type CreateCommentRequest = {
  content: string;
  parentCommentId?: string;
};

// TODO: Define CreateCommentResponse type (comment)
export type CreateCommentResponse = {
  comment: Comment;
};

// TODO: Define UpdateCommentRequest type (content?, resolved?)
export type UpdateCommentRequest = {
  content?: string;
  resolved?: boolean;
};

// TODO: Define GetCommentsResponse type (comments array with nested replies)
export type GetCommentsResponse = {
  comments: Comment[];
};
