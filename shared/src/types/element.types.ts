// Element Types

// TODO: Define ElementType enum (NOTE, TODO, IMAGE, PDF, LINK, COMMENT_PIN)
export enum ElementType {
  NOTE,
  TODO,
  IMAGE,
  PDF,
  LINK,
  COMMENT_PIN,
}
// TODO: Define base Element type (id, boardId, type, positionX, positionY, width, height, createdAt, updatedAt)
export type Element = {
  id: string;
  boardId: string;
  type: ElementType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
};
// TODO: Define element data types for each type:
//   - NoteData (text, color)
export type NoteData = {
  text: string;
  color: string;
};
//   - TodoData (title, items[])
export type TodoData = {
  title: string;
  items: string[];
};
//   - ImageData (url, fileName, thumbnailUrl)
export type ImageData = {
  fileName: string;
  thumbnailUrl: string;
};
//   - PdfData (url, fileName, pageCount)
export type PdfData = {
  url: string;
  fileName: string;
  pageCount: number;
};
//   - LinkData (url, title)
export type LinkData = {
  url: string;
  title: string;
};
//   - CommentPinData (threadId, userInitial)
export type CommentPinData = {
  threadId: string;
  userInitial: string;
};

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

// TODO: Define specific element types (NoteElement, TodoElement, etc.)
export type NoteElement = {
  type: "note";
  data: NoteData;
};

export type TodoElement = {
  type: "todo";
  data: TodoData;
};

export type ImageElement = {
  type: "image";
  data: ImageData;
};

export type PdfElement = {
  type: "pdf";
  data: PdfData;
};

export type LinkElement = {
  type: "link";
  data: LinkData;
};

export type CommentElement = {
  type: "comment";
  data: CommentPinData;
};

// TODO: Define CreateElementRequest type
export type CreateElementRequest = {
  type: ElementType;
  position: Position;
  size: Size;
  data: NoteData | TodoData | ImageData | PdfData | CommentPinData | LinkData;
};

export type UpdateElementRequest = {
  id: string;
  position?: Position;
  size?: Size;
  data?: NoteData | TodoData | ImageData | PdfData | CommentPinData | LinkData;
};

export type ElementPositionUpdateRequest = {
  id: string;
  x: number;
  y: number;
};
