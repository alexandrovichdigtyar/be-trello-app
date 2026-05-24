/**
 * Shared contracts, DTOs, and types for services.
 */

/** Разделитель, если в `member.role` несколько ролей (расширение на будущее). */
export const ROLE_DELIMITER = ',';

/** Claims, которые сервисы ожидают в JWT (gateway → заголовки). */
export type IdentityClaims = {
  userId: string;
  orgId: string | null;
  perms: string[];
};

