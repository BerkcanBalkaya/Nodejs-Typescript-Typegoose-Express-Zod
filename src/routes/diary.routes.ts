import express from "express";
import {
  createDiaryHandler,
  deleteDiaryHandler,
  getAllDiaryHandler,
  updateDiaryHandler,
} from "../controller/diary.controller";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResourse";
import {
  createDiarySchema,
  deleteDiarySchema,
  updateDiarySchema,
} from "../schema/diary.shcema";
const router = express.Router();

router.get("/api/diaries/", requireUser, getAllDiaryHandler);

router.post(
  "/api/diaries/",
  [validateResource(createDiarySchema), requireUser],
  createDiaryHandler
);

router.delete(
  "/api/diaries/:id",
  [validateResource(deleteDiarySchema), requireUser],
  deleteDiaryHandler
);

router.put(
  "/api/diaries/:id",
  [validateResource(updateDiarySchema), requireUser],
  updateDiaryHandler
);

export default router;
