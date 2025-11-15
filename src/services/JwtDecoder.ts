// services/JwtDecoder.ts
export interface DecodedToken {
  sub: string; // User ID
  email: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string; // name
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string; // role
  jti: string;
  permissions: string[]; // Array of permissions like AI_CHATTING, SOCIAL_NETWORK
  exp: number; // expiration time
  iss: string;
  aud: string;
}

export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid token format");
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as DecodedToken;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const hasPermission = (
  permissions: string[] | undefined,
  requiredPermission: string
): boolean => {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }
  return permissions.includes(requiredPermission);
};

export const hasAllPermissions = (
  permissions: string[] | undefined,
  requiredPermissions: string[]
): boolean => {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }
  return requiredPermissions.every((perm) => permissions.includes(perm));
};

export const hasAnyPermission = (
  permissions: string[] | undefined,
  requiredPermissions: string[]
): boolean => {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }
  return requiredPermissions.some((perm) => permissions.includes(perm));
};
