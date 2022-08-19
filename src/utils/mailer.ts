// * smtp (simple message transfer protocol) ama eğer gerçek bir proje yapılacaksa bunun kullanılmaması lazım. Gerçek bir server kullanılmalı
import nodemailer, { SendMailOptions } from "nodemailer";
import config from "config";
import log from "./logger";
// *createTestCreds e sadece credentials oluşturmak ve buradan gelen bilgileri default.ts config'ine kaydetmek için kullandık o yüzden artık yorum satırı olarak duruyor
// async function createTestCreds() {
//   const creds = await nodemailer.createTestAccount();
//   console.log({ creds });
// }

// createTestCreds();
const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>("smtp");

// * transporterı sendEmail içerisinde yapmamamızın sebebi sadece aplication başlatıldığında bir transporter oluşturup onu sürekli kullanmak istememiz yoksa her sendEmail çalıştığında tekrar transporter oluşturulacak
const transporter = nodemailer.createTransport({
  ...smtp,
  auth: { user: smtp.user, pass: smtp.pass },
});
async function sendEmail(payload: SendMailOptions) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Mail gönderilirken hata oluştu");
      return;
    }
    log.info(`Inceleme URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
