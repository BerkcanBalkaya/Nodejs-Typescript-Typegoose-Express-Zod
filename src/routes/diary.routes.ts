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

// TODO: Sorulacaklar
// * 1)yukarıdaki gibi routeları belirtmeme rağmen postmen hata veriyor
// * 2)controller içerisinde update, delete için özel olarak servisler yazıp onlar üzerinden mi işlemleri yapmak mantıklı
// *    findbyIdAndDelete ve update versiyonlarını kullanmak gibi yoksa benim yaptığım gibi olanı mı mantıklı id den bul sil veya id den bul fieldları doldur savele gibi
// * 3)çoğu yerde diary nin boş gelmeyeceğini belirtmek için ! veya ? kullanmak zorunda kaldım bunun farklı bir yolu olabilir mi
// * 4)
