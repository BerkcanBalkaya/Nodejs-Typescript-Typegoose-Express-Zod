import UserModel, { User } from "../model/user.model";

export function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export function findUserById(id: string) {
  return UserModel.findById(id);
}

export function findUserByEmail(email: string) {
  // * .lean dendiği zaman asıl dokümanın json object halini elde ederiz.
  return UserModel.findOne({ email });
}

export function getAdminCount() {
  return UserModel.count({ role: "Admin" });
}

export function anyAdminExists() {
  return UserModel.findOne({ role: "Admin" });
}
