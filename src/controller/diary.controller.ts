import { Request, Response } from "express";
import { Diary } from "../model/diary.model";
import UserModel, { User } from "../model/user.model";
import {
  CreateDiaryInput,
  DeleteDiaryInput,
  UpdateDiaryInput,
} from "../schema/diary.shcema";
import {
  createDiary,
  getAllDiaryById,
  getDiaryById,
} from "../service/diary.service";

// import { findUserById } from "../service/user.service";
// TODO: mesela buarada userıd çekilirken önce id çekip bundan finduserbyid yapıyorum referans olarak çalışsın diye bunun başka bir yolu olamaz mı
// TODO: mesela bizim app.use() olarak kullandığımız middleware yüzünden response içerisinde her seferinde user bilgileri gönderiliyor bu günvenlik açığı oluşturmaz mı
// export async function getAllDiaryHandler(req: Request, res: Response) {
//   const userId = res.locals.user._id;
//   try {
//     const user = await findUserById(userId);
//     console.log(...user?.diary);
//     return res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// }

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
    const diary = await createDiary(body);
    console.log(diary.delete);

    // diary!.user?.push(userId);
    // diary.save()

    // const user = await findUserById(userId);
    // TODO: Burada mesela biz middleware ile user var mı yokmu kontrol etmemize rağmen user null olabilir diye bize uyarı veriyor bunu ! dışında çözebilir miyiz
    // user!.diary.push(diary._id);
    // user!.save();

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
  const id = req.params.id;
  const userId = res.locals._id;

  try {
    const diary = await getDiaryById(userId);
    // TODO: Hani null dönmesinin bana göre bir yolu yok ama yine de sormak istedim belki döner diye
    if (id !== diary?.user?.toString() || null) {
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
  const userId = res.locals._id;
  try {
    const diary = await getDiaryById(userId);
    if (id !== diary?.user?.toString() || "") {
      return res.send(
        "Lütfen güncellemek istediğiniz diary'nin size ait olduğundan emin olun"
      );
    }
    diary!.title = title;
    diary!.body = body;
    diary?.save();
  } catch (e) {
    return res.status(500).send(e);
  }
}
