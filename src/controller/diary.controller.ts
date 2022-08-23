import { Request, Response } from "express";
import { Diary } from "../model/diary.model";
import UserModel, { User } from "../model/user.model";
import {
  CreateDiaryInput,
  DeleteDiaryInput,
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
    const body = await getAllDiaryById(userId);
    res.send(body);
  } catch (e) {
    return res.status(404).send(e);
  }
}

export async function createDiaryHandler(
  req: Request<{}, {}, CreateDiaryInput>,
  res: Response
) {
  // * referans koparmak için yaptım ama başka yolu var mı acaba
  const body = Object.assign(req.body);
  const userId = res.locals.user._id;
  body.user = userId;
  console.log(body);

  try {
    if (await checkTitleExistsForUser(userId, body.title)) {
      return res.send(
        "Oluşturmaya çalıştığınız günlük başlığında başka bir günlüğünüz bulunmakta. Lütfen farklı bir başlık belirleyiniz."
      );
    }
    await createDiary(body);
    return res.send("Başarılı bir şekilde günlük oluşturdunuz");
  } catch (e: any) {
    if (e.code === 11000) {
      return res
        .status(409)
        .send("Oluşturulmaya çalışılan diary başlığı zaten bulunmakta");
    }
    return res.status(500).send(e);
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
    // TODO: Hani null dönmesinin bana göre bir yolu yok ama yine de sormak istedim belki döner diye
    if (!diary) {
      return res.send(
        "Lütfen bu id ye ait sahip bir diary'i olduğundan emin olun"
      );
    }
    console.log(diaryId, userId);

    if (userId !== diary?.user?.toString() || null) {
      return res.send(
        "Lütfen silmek istediğiniz diary'nin size ait olduğundan emin olun"
      );
    }
    diary.delete();
    return res.send(
      `${diary.title} başlıklı günlüğünüz başarılı bir şekilde silindi`
    );
  } catch (e) {
    return res.status(500).send(e);
  }
}

export async function updateDiaryHandler(
  req: Request<UpdateDiaryInput["params"], {}, UpdateDiaryInput["body"]>,
  res: Response
) {
  const id = req.params.id;
  const { title, body } = req.body;
  const userId = res.locals.user._id;

  console.log(userId, id);

  try {
    const diary = await getDiaryById(id);
    // TODO: Burada han var mı yok mu emin olamadığımız için kullandığımız soru işaretleri yerine farklı bir yaklaşımla boş olamayacağını söyleyebilir miyiz
    if (userId !== diary?.user?.toString() || "") {
      return res.send(
        "Lütfen güncellemek istediğiniz diary'nin size ait olduğundan emin olun"
      );
    }
    diary!.title = title;
    diary!.body = body;
    diary?.save();
    return res.send("Güncelleme işlemi başarılı bir şekilde gerçekleştirildi.");
  } catch (e) {
    return res.status(500).send(e);
  }
}

// TODO: 1)Bu kullanıcı bilgilerinin nasıl alındığına bir daha baktım ve bu bilgileri jwt token içerisinden alıyor muşuz biz.
// * Peki o zaman kullanıcı bilgilerinin mesela admin olup olmadığı gibi jwt token içerisinde tutmamız ne kadar doğru bu token üzerinde oynama yapılıp kullanıcı kendisini admin gibi gösterip token atabilir mi
// * Eğer atabiliyorsa bu benim tarafta güvenlik açığı doğurur.
