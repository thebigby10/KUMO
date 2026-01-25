import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// export const authenticateToken = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ): void => {
//   // BYPASS: Automatically attach a developer user
//   req.user = {
//     userId: "dev-user-id", // Use a real UUID from your DB if you want to see your actual data
//     email: "dev@example.com",
//   };

//   console.log("🛠️ Dev Bypass: Authenticated as", req.user.email);
//   next();
// };

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = user as { userId: string; email: string };

    next();
  });
};
