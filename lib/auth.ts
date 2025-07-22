import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.ENCRYPT_KEY || 'fallback-secret-key');
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8時間

export interface SessionData extends JWTPayload {
  authenticated: boolean;
  expiresAt: number;
}

// パスワードを検証
export function verifyPassword(inputPassword: string): boolean {
  const correctPassword = process.env.NEXT_PUBLIC_PASSWORD;
  return inputPassword === correctPassword;
}

// セッショントークンを生成
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;
  
  const payload = {
    authenticated: true,
    expiresAt
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(expiresAt))
    .sign(JWT_SECRET);

  return token;
}

// セッショントークンを検証
export async function verifySessionToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sessionData = payload as unknown as SessionData;
    
    // 有効期限をチェック
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// セッションの有効期限をチェック
export function isSessionValid(sessionData: SessionData): boolean {
  return sessionData.authenticated && Date.now() < sessionData.expiresAt;
}