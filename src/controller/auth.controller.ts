import { Request, Response } from "express";
import { get } from "lodash";
import { CreateSessionInput } from "../schema/auth.schema";
import {
  findSessionById,
  signAccessToken,
  singRefreshToken,
} from "../service/auth.service";
import { findUserByEmail, findUserById } from "../service/user.service";
import { verifyJwt } from "../utils/jwt";

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Geçersiz email veya şifre girdiniz";
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    return res.send(message);
  }
  if (!user.verified) {
    return res.send("Lütfen email adresinizi onaylayın");
  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.send(message);
  }
  // * access token gir
  const accessToken = signAccessToken(user);
  // * refresh token gir
  const refreshToken = await singRefreshToken({ userId: user._id });
  // * tokenleri gönder
  return res.send({ accessToken, refreshToken });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = get(req, "headers.x-refresh");
  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );
  if (!decoded) {
    return res.status(401).send("Giriş tokeni yenilenemedi");
  }
  const session = await findSessionById(decoded.session);
  if (!session || !session.valid) {
    return res.status(401).send("Giriş tokeni yenilenemedi");
  }
  console.log(String(session.user));

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send("Giriş tokeni yenilenemedi");
  }

  const accessToken = signAccessToken(user);
  return res.send({ accessToken });
}
