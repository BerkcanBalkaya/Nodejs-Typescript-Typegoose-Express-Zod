import DiaryModel, { Diary } from "../model/diary.model";

export function createDiary(input: Partial<Diary>) {
  return DiaryModel.create(input);
}

export function getAllDiaryById(id: string) {
  return DiaryModel.find({ user: id });
}

export function getDiaryById(id: string) {
  return DiaryModel.findById(id);
}

export function checkTitleExistsForUser(id: string, newTitle: string) {
  return DiaryModel.findOne({ title: newTitle, user: id });
}
