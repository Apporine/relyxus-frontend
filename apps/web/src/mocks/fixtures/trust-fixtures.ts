import type { TrustDocument } from '@/features/trust-centre/model';

/* DEVELOPMENT FIXTURE. Trust Centre documents (Figma frame 23). */

const trustDocuments: TrustDocument[] = [
  {
    id: 'doc-iso-27001',
    title: 'ISO 27001 certificate',
    category: 'certifications',
    version: '2026',
    status: 'current',
    audience: 'public',
    updatedAt: '2026-10-01T09:00:00Z',
    downloadUrl: '/trust/files/iso-27001-certificate.pdf',
    isSubscribable: false,
  },
  {
    id: 'doc-soc2',
    title: 'SOC 2 Type II report',
    category: 'certifications',
    version: 'FY26',
    status: 'current',
    audience: 'nda',
    updatedAt: '2026-09-18T09:00:00Z',
    downloadUrl: null,
    isSubscribable: false,
  },
  {
    id: 'doc-pentest',
    title: 'Penetration test executive summary',
    category: 'penetration-tests',
    version: 'Q3 2026',
    status: 'current',
    audience: 'nda',
    updatedAt: '2026-09-02T09:00:00Z',
    downloadUrl: null,
    isSubscribable: false,
  },
  {
    id: 'doc-data-flow',
    title: 'Self-hosted data flow',
    category: 'architecture',
    version: 'v5',
    status: 'current',
    audience: 'public',
    updatedAt: '2026-08-28T09:00:00Z',
    downloadUrl: '/trust/files/self-hosted-data-flow.pdf',
    isSubscribable: false,
  },
  {
    id: 'doc-continuity',
    title: 'Business continuity statement',
    category: 'continuity',
    version: 'v3',
    status: 'current',
    audience: 'public',
    updatedAt: '2026-08-12T09:00:00Z',
    downloadUrl: '/trust/files/business-continuity-statement.pdf',
    isSubscribable: false,
  },
  {
    id: 'doc-subprocessors',
    title: 'Sub-processor list',
    category: 'subprocessors',
    version: 'Oct 2026',
    status: 'current',
    audience: 'public',
    updatedAt: '2026-10-01T09:00:00Z',
    downloadUrl: '/trust/files/sub-processors.pdf',
    isSubscribable: true,
  },
  {
    id: 'doc-security-policy',
    title: 'Information security policy',
    category: 'policies',
    version: 'v8',
    status: 'current',
    audience: 'nda',
    updatedAt: '2026-07-15T09:00:00Z',
    downloadUrl: null,
    isSubscribable: false,
  },
  {
    id: 'doc-pentest-2025',
    title: 'Penetration test executive summary',
    category: 'penetration-tests',
    version: 'Q3 2025',
    status: 'superseded',
    audience: 'nda',
    updatedAt: '2025-09-04T09:00:00Z',
    downloadUrl: null,
    isSubscribable: false,
  },
  {
    id: 'doc-legacy-architecture',
    title: 'Legacy architecture',
    category: 'architecture',
    version: 'v2',
    status: 'superseded',
    audience: 'internal',
    updatedAt: '2026-01-04T09:00:00Z',
    downloadUrl: null,
    isSubscribable: false,
  },
];

/** Buyers never receive internal documents. */
export function publicTrustDocuments(): TrustDocument[] {
  return trustDocuments.filter((document) => document.audience !== 'internal');
}

export function managedTrustDocuments(): TrustDocument[] {
  return trustDocuments;
}

export function isRequestableTrustDocument(documentId: string): boolean {
  return publicTrustDocuments().some(
    (document) => document.id === documentId && document.audience === 'nda',
  );
}
