import jwt from "jsonwebtoken";
import config from "config";

export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  const signinKey = Buffer.from(config.get<string>(keyName), "base64").toString(
    "ascii"
  );
  // console.log(
  //   config.get<string>(keyName) + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  // );
  // console.log(process.env);

  return jwt.sign(object, signinKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}
export function verifyJwt<T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null {
  const publicKey = Buffer.from(config.get<string>(keyName), "base64").toString(
    "ascii"
  );

  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}

// TODO: single linear, SAST (STATİC APPLİCATİON SECURİTY TESTİNG), OWASP
