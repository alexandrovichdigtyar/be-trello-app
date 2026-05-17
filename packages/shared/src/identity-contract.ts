export interface IdentityClaims {
  userId: string;
  orgId: string | null;
  perms: string[];
}

export const ROLE_DELIMITER = ",";
