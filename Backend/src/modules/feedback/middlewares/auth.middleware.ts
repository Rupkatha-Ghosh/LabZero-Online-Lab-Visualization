import { NextFunction, Request, Response } from "express";

type RequestWithUser = Request & {
  user?: {
    id?: string;
    role?: string;
    is_staff?: boolean;
    is_superuser?: boolean;
  };
};

export const requireAuth = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (req.user || authorization?.startsWith("Bearer ")) {
    next();
    return;
  }

  res.status(401).json({
    success: false,
    message: "Authentication is required.",
  });
};

export const requireAdmin = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const role =
    req.user?.role ||
    String(req.headers["x-user-role"] || req.headers["x-labzero-role"] || "");
  const isAdmin =
    role === "admin" ||
    role === "institute" ||
    req.user?.is_staff ||
    req.user?.is_superuser;

  if (isAdmin) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: "Admin role is required.",
  });
};
