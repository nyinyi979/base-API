export type TLogin = {
  email: string;
  password: string;
};

export type TSignup = {
  username: string;
  email: string;
  password: string;
  role: number;
};

export type TUpdate = {
  id: number;
  username: string;
  email: string;
  password: string | null;
  role: number;
};
