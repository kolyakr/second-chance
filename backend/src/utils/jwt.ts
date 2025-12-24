import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const generateEmailVerificationToken = (): string => {
  const options: SignOptions = {
    expiresIn: "24h",
  };

  return jwt.sign({ type: "email-verification" }, JWT_SECRET, options);
};

export const generatePasswordResetToken = (): string => {
  const options: SignOptions = {
    expiresIn: "1h",
  };

  return jwt.sign({ type: "password-reset" }, JWT_SECRET, options);
};
