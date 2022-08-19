import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

export class Session {
  @prop({ ref: () => User })
  user: Ref<User>;

  //TODO: Benim bildiğim kadarı ile bu tarz login stateleri veri tabanında tutulmaması ve buradan kontrol edilmemesi gereken şeylerdi bunu bir danış
  @prop({ default: true })
  valid: boolean;
}

const SessionModel = getModelForClass(Session, {
  schemaOptions: {
    timestamps: true,
  },
});

export default SessionModel;
