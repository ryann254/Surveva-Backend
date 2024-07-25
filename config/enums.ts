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

export enum Origin {
  DSA = 'dsa',
  QMS = 'qms',
}

export enum TokenTypes {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

export type RolesMap = {
  [key in Roles]: string[];
};

const allRoles: RolesMap = {
  admin: ['manageCategories', 'managePolls', 'manageUsers'],
  user: ['managePolls', 'manageUsers'],
};

export const roles = Object.values(Roles);
export const gender = Object.values(Gender);
export const platform = Object.values(Platform);
export const origin = Object.values(Origin);
export const tokenTypes = Object.values(TokenTypes);
export const roleRights = new Map(Object.entries(allRoles));
