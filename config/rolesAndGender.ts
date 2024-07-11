export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum Platform {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}

export type RolesMap = {
  [key in Roles]: string[];
};

// TODO: Add roles for admins and users.
const allRoles: RolesMap = {
  admin: [],
  user: [],
};

export const roles = Object.values(Roles);
export const gender = Object.values(Gender);
export const platform = Object.values(Platform);
export const roleRights = new Map(Object.entries(allRoles));
