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
  // * referans koparmak için yaptım ama başka yolu var mı acaba
  const body = Object.assign(req.body);
  // console.log(body);
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
    // * Aşağıda eski modeldeki unique title mantığına göre hata döndüğünde yakalamamızı sağlayan catch mantığı var ama her kullanıcı kendi hesabında title 1 diye oluşturabilsin ve kullanıcılarının birbirnini kısıtlamaması için yukarıya farklı bir if kontrolü konuldu.
    // if (e.code === 11000) {
    //   return res.status(409).send({
    //     message: "Oluşturulmaya çalışılan diary başlığı zaten bulunmakta",
    //     body: "",
    //   });
    // }
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
    // TODO: Hani null dönmesinin bana göre bir yolu yok ama yine de sormak istedim belki döner diye
    if (!diary) {
      return res.status(404).send({
        message: "Lütfen bu id ye ait bir diaryi olduğundan emin olun",
        body: diaryId,
      });
    }
    // console.log(diaryId, userId);

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

  // console.log(userId, id);

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

// TODO: 1)Bu kullanıcı bilgilerinin nasıl alındığına bir daha baktım ve bu bilgileri jwt token içerisinden alıyor muşuz biz.
// * Peki o zaman kullanıcı bilgilerinin mesela admin olup olmadığı gibi jwt token içerisinde tutmamız ne kadar doğru bu token üzerinde oynama yapılıp kullanıcı kendisini admin gibi gösterip token atabilir mi
// * Eğer atabiliyorsa bu benim tarafta güvenlik açığı doğurur.
