import { Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schema/user.schema";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../service/user.service";
import log from "../utils/logger";
import sendEmail from "../utils/mailer";

// * Burada Request için yapılan generik tip belirlemesinde ilk 2 tipin boş obje olmasının sebebi bunların Request üzerinde params ve response body e denk gelmesi bize bunlar lazım değil
export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;
  console.log(body);

  try {
    const user = await createUser(body);
    await sendEmail({
      from: "test@example.com",
      to: user.email,
      subject: "Lütfen email adresinizi doğrulayınız",
      text: `Onaylama kodunuz ${user.verificationCode} Id: ${user._id}`,
    });
    // * Burada userın zaten olup olmadığını kontrol etmememizin sebebi user.modelde zaten email kısmında unique:true dediğimiz için hata alacak olmamız ve bunu da burada try içerisinde yakalamamızdan kaynaklı
    return res.send("Kullanıcı başarılı bir şekilde oluşturuldu");
  } catch (e: any) {
    // * 11000 unique kısıtının ihlal edildiği anlamına gelir
    if (e.code === 11000) {
      // * 409 burada conflict anlamına gelmektedir.
      return res
        .status(409)
        .send("Oluşturulmaya çalışılan hesap zaten bulunmakta");
    }
    return res.status(500).send(e);
  }
}
// * Request generiklerinden params için kullanılanı ilki olduğu için direk yazdık burada
export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const id = req.params.id;
  const verificationCode = req.params.verificationCode;

  console.log(req.params);

  // * Kullanıcıyı id sine göre bul
  const user = await findUserById(id);
  console.log(user);
  if (!user) {
    return res.send("Kullanıcı bulunamadı");
  }

  // * Email onaylanmış mı onaylanmamış mı bak
  if (user.verified) {
    return res.send("Kullanıcı email adresi onaylanmamış");
  }

  // * Onaylanma kodu eşleşiyo mu ona bak
  if (user.verificationCode === verificationCode) {
    user.verified = true;
    await user.save();
    return res.send("Kullanıcı emaili başarılı bir şekilde onaylandı");
  }

  return res.send("Kullanıcı emaili onaylanamadı");
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const message =
    "Eğer bu emaile sahip bir kullanıcı varsa size şifre yenileme maili gönderilecektir";
  const { email } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    log.debug(`Bu ${email} sahip bir kullanıcı bulunmamaktadır`);
    return res.send(message);
  }
  if (!user.verified) {
    return res.send("Email onaylanmamış");
  }
  const passwordResetCode = nanoid();
  user.passwordResetCode = passwordResetCode;
  await user.save();
  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Şifre sıfırlama maili",
    text: `Şifre sıfırlama kodunuz: ${passwordResetCode} - Id ${user._id}`,
  });
  log.debug(`Şifre sıfırlama emaili ${email}}`);
  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;
  const { password } = req.body;
  const user = await findUserById(id);
  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send("Şifre sıfırlama sırasında bir hata oluştu");
  }

  user.passwordResetCode = null;
  // * Burada hash işlemi yapılmamasının sebebi user model tanımlanırken @pre tagı içerisinde save işlemi yapılmadan önce password kısmında bir modified işlemi olursa hashlemesini sağlamamızdır.
  user.password = password;
  await user.save();
  return res.send("Başarılı bir şekilde şifre sıfırlandı");
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.send(res.locals.user);
}
