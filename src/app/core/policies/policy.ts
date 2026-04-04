export type Role = 'SUPERADMIN' | 'ENCARGADO' | 'SECRETARIA' | 'INSPECTOR';

export type Permission =
  | 'CASE_FILE_READ'
  | 'CASE_FILE_WRITE'
  | 'PROCEDURE_TRANSITION'
  | 'DOCUMENT_UPLOAD'
  | 'ADMIN_ACCESS';

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  SECRETARIA: new Set(['CASE_FILE_READ', 'CASE_FILE_WRITE', 'DOCUMENT_UPLOAD']),
  ENCARGADO: new Set(['CASE_FILE_READ', 'CASE_FILE_WRITE', 'DOCUMENT_UPLOAD']),
  INSPECTOR: new Set(['CASE_FILE_READ', 'PROCEDURE_TRANSITION', 'DOCUMENT_UPLOAD']),
  SUPERADMIN: new Set(['CASE_FILE_READ', 'CASE_FILE_WRITE', 'PROCEDURE_TRANSITION', 'DOCUMENT_UPLOAD', 'ADMIN_ACCESS']),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}
