// Collaborator Types

// TODO: Define Role enum (OWNER, EDITOR, VIEWER)
export enum Role {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
}

// TODO: Define Collaborator type (userId, name, email, role, addedAt)
export type Collaborator = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  addedAt: Date;
};

// TODO: Define AddCollaboratorRequest type (email, role)
export type AddCollaboratorRequest = {
  email: string;
  role: Role;
};

// TODO: Define AddCollaboratorResponse type (collaborator)
export type AddCollaboratorResponse = {
  collaborator: Collaborator;
};

// TODO: Define UpdateCollaboratorRequest type (role)
export type UpdateCollaboratorRequest = {
  role: Role;
};

// TODO: Define GetCollaboratorsResponse type (collaborators array)
export type GetCollaboratorsResponse = {
  collaborators: Collaborator[];
};
