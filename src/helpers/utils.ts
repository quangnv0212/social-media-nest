import * as bcrypt from 'bcrypt';
const saltRounds = 10;
export const hashPasswordHelper = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};
export const comparePasswordHelper = async (
  password: string,
  hashPassword: string,
) => {
  return await bcrypt.compare(password, hashPassword);
};
