import mongoose from "mongoose";
export const userId = new mongoose.Types.ObjectId();
export const randomId = new mongoose.Types.ObjectId();
export const diaryPayload = {
  user: userId,
  title: "test diary 1",
  body: "test body 1",
};

export const diaryPayload2 = {
  user: userId,
  title: "test diary 2",
  body: "test body 2",
};

export const diaryUserPayload = {
  _id: userId,
  email: "berkcan@gmail.com",
  name: "Berkcan",
};

export const diaryUserPayload2 = {
  _id: randomId,
  email: "balkaya@gmail.com",
  name: "Balkaya",
};
