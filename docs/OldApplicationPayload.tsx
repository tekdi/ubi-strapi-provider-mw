// Old Application Payload Structure (Before Refactoring)
// This file contains the previous payload structure for reference

export interface OldApplicationPayload {
  class_doc: string; // base64 encoded document
  annualIncome_doc: string; // base64 encoded document
  firstName: string;
  middleName: string;
  lastName: string;
  annualIncome: string;
  class: string;
  benefitId: string;
}

// Example of old payload:
export const oldPayloadExample = {
  "class_doc": "base64,JTdCJTIyJTQwY29udGV4dCUyMi...",
  "annualIncome_doc": "base64,JTdCJTIyJTQwY29udGV4dCUyMi...",
  "firstName": "Manoj",
  "middleName": "null",
  "lastName": "Londhe",
  "annualIncome": "10000",
  "class": "12",
  "benefitId": "xo0aetnstxlnrw2fq7j1hbqu"
};

// Migration Notes:
// - Only 2 document types were supported: class_doc and annualIncome_doc
// - Simple base64 encoding without metadata
// - Limited validation and field structure
// - No VC (Verifiable Credentials) support
