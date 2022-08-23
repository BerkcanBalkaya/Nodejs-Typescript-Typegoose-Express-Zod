import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { User } from "./user.model";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Diary {
  @prop({ required: true })
  title: string;

  @prop({ required: true })
  body: string;

  @prop({ ref: () => User })
  user: Ref<User>;
}

const DiaryModel = getModelForClass(Diary);
export default DiaryModel;
