import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
  pre,
  DocumentType,
  index,
  Ref,
} from "@typegoose/typegoose";
import { nanoid } from "nanoid";
import argon2 from "argon2";
import log from "../utils/logger";
import { anyAdminExists } from "../service/user.service";

export const privateFields = [
  "password",
  "__v",
  "verificationCode",
  "passwordResetCode",
  "verified",
];

@pre<User>("save", async function () {
  if (!anyAdminExists()) {
    this.role = "Admin";
  }
  if (!this.isModified("password")) {
    return;
  }
  const hash = await argon2.hash(this.password);
  this.password = hash;
  return;
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({ lowercase: true, required: true, unique: true })
  email: string;

  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true })
  password: string;

  @prop({ ref: () => User })
  diary: Ref<User>[];

  @prop({ required: true, default: () => nanoid() })
  verificationCode: string;

  @prop()
  passwordResetCode: string | null;

  @prop({ default: false })
  verified: boolean;

  @prop({
    default: "User",
    enum: ["Admin", "Moderator", "User"],
  })
  role: string;

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      return await argon2.verify(this.password, candidatePassword);
    } catch (e) {
      log.error(e, "Şifre doğrulanamadı");
      return false;
    }
  }
}

const UserModel = getModelForClass(User);
export default UserModel;
