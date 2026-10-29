import { NextRequest } from "next/server";

export const AUTH_TOKEN = "babak-auth-token-secret-12345";

export function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;
  
  const token = authHeader.split(" ")[1];
  return token === AUTH_TOKEN;
}
