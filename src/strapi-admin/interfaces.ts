export interface StrapiUserRole {
  id: number;
  name: string;
  description: string;
  code: string;
}

export interface StrapiUserResponse {
  id: number;
  documentId: string;
  firstname: string;
  lastname: string;
  username: string | null;
  email: string;
  isActive: boolean;
  blocked: boolean;
  preferedLanguage: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  roles: StrapiUserRole[];
  registrationToken: string;
}

export interface StrapiRegisterResponse {
  token: string;
  user: {
    id: number;
    documentId: string;
    firstname: string;
    lastname: string;
    username: string | null;
    email: string;
    isActive: boolean;
    blocked: boolean;
    preferedLanguage: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string | null;
    roles: StrapiUserRole[];
  };
}

export interface FieldProperty {
  label: string;
  value: string;
  required?: boolean;
  children?: FieldProperty[];
}

export interface SectionProperty {
  label: string;
  value: string;
  children: FieldProperty[];
}

export interface FieldSubject {
  uid: string;
  label: string;
  properties: SectionProperty[];
}
