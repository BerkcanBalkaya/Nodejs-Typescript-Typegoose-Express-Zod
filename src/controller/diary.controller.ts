import { Request, Response } from "express";
import {
  CreateDiaryInput,
  DeleteDiaryInput,
  GetDiaryInput,
  UpdateDiaryInput,
} from "../schema/diary.shcema";
import {
  checkTitleExistsForUser,
  createDiary,
  getAllDiaryById,
  getDiaryById,
} from "../service/diary.service";

export async function getAllDiaryHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;
  try {
    const diaries = await getAllDiaryById(userId);
    if (diaries.length === 0) {
      res.status(404).send({
        message: "Size ait diary bulunmamakta.",
        body: "",
      });
    }
    res.send({
      message: "Başarılı bir şekilde size ait olan tüm diaryleri getirdiniz.",
      body: diaries,
    });
  } catch (e) {
    return res.status(500).send({
      message: "Bir şeyler ters gitti.",
      body: e,
    });
  }
}

export async function getDiaryHandler(
  req: Request<GetDiaryInput>,
  res: Response
) {
  const diaryId = req.params.id;
  const userId = res.locals.user._id;

  try {
    const diary = await getDiaryById(diaryId);
    if (!diary) {
      return res.status(404).send({
        message: "Lütfen bu id ye ait bir diary olduğuna emin olun",
        body: "",
      });
    }
    if (userId !== diary.user?.toString() || null) {
      return res.status(403).send({
        message:
          "Lütfen incelemek istediğiniz diary'nin size ait olduğundan emin olun",
        body: "",
      });
    }

    return res.send({
      message: "Başarılı bir şekilde istenilen diary'i getirdiniz.",
      body: diary,
    });
  } catch (e) {
    return res.status(500).send({
      message: "Bir şeyler ters gitti.",
      body: e,
    });
  }
}

export async function createDiaryHandler(
  req: Request<{}, {}, CreateDiaryInput>,
  res: Response
) {
  const body = Object.assign(req.body);
  const userId = res.locals.user._id;
  body.user = userId;

  try {
    if (await checkTitleExistsForUser(userId, body.title)) {
      return res.status(409).send({
        message:
          "Oluşturmaya çalıştığınız günlük başlığında başka bir günlüğünüz bulunmakta. Lütfen farklı bir başlık belirleyiniz.",
        body: body,
      });
    }
    const diary = await createDiary(body);
    return res.send({
      message: "Başarılı bir şekilde günlük oluşturdunuz",
      body: diary,
    });
  } catch (e: any) {
    return res.status(500).send({
      message: "Bir şeyler ters gitti.",
      body: e,
    });
  }
}

export async function deleteDiaryHandler(
  req: Request<DeleteDiaryInput>,
  res: Response
) {
  const diaryId = req.params.id;
  const userId = res.locals.user._id;

  try {
    const diary = await getDiaryById(diaryId);
    if (!diary) {
      return res.status(404).send({
        message: "Lütfen bu id ye ait bir diaryi olduğundan emin olun",
        body: diaryId,
      });
    }

    if (userId !== diary?.user?.toString() || null) {
      return res.status(403).send({
        message:
          "Lütfen silmek istediğiniz diary'nin size ait olduğundan emin olun",
        body: diaryId,
      });
    }
    diary.delete();
    return res.send({
      message: `${diary.title} başlıklı günlüğünüz başarılı bir şekilde silindi`,
      body: diary,
    });
  } catch (e) {
    return res.status(500).send({
      message: "Bir şeyler ters gitti.",
      body: e,
    });
  }
}

export async function updateDiaryHandler(
  req: Request<UpdateDiaryInput["params"], {}, UpdateDiaryInput["body"]>,
  res: Response
) {
  const diaryId = req.params.id;
  const { title, body } = req.body;
  const userId = res.locals.user._id;


  try {
    const diary = await getDiaryById(diaryId);
    // TODO: Burada han var mı yok mu emin olamadığımız için kullandığımız soru işaretleri yerine farklı bir yaklaşımla boş olamayacağını söyleyebilir miyiz
    if (!diary) {
      return res.status(404).send({
        message: "Lütfen bu id ye ait bir diaryi olduğundan emin olun",
        body: diaryId,
      });
    }
    if (userId !== diary?.user?.toString() || "") {
      return res.status(403).send({
        message:
          "Lütfen güncellemek istediğiniz diary'nin size ait olduğundan emin olun",
        body: diaryId,
      });
    }
    diary!.title = title;
    diary!.body = body;
    diary?.save();
    return res.send({
      message: "Güncelleme işlemi başarılı bir şekilde gerçekleştirildi.",
      body: diary,
    });
  } catch (e) {
    return res.status(500).send({
      message: e,
      body: "",
    });
  }
}
