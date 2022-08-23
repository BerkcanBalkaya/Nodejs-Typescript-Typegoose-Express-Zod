import express from "express";
import {
  assignRoleHandler,
  createUserHandler,
  forgotPasswordHandler,
  getCurrentUserHandler,
  resetPasswordHandler,
  verifyUserHandler,
} from "../controller/user.controller";
import requireAdmin from "../middleware/checkAdminExists";
import checkAdminExists from "../middleware/checkAdminExists";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResourse";
import {
  assignRoleSchema,
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";

const router = express.Router();

router.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserHandler
);

router.post(
  "/api/users/verify/:id/:verificationCode",
  validateResource(verifyUserSchema),
  verifyUserHandler
);

router.post(
  "/api/users/forgotpassword",
  validateResource(forgotPasswordSchema),
  forgotPasswordHandler
);

router.post(
  "/api/users/resetpassword/:id/:passwordResetCode",
  validateResource(resetPasswordSchema),
  resetPasswordHandler
);

router.post(
  "/api/admin/assignrole/:id",
  [validateResource(assignRoleSchema), requireAdmin],
  assignRoleHandler
);

router.get("/api/users/me", requireUser, getCurrentUserHandler);
export default router;
