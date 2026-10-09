'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { accessRequestReceiptSchema, trustDocumentListSchema, type AccessRequest } from './model';

/** Documents a buyer may see: public and NDA-gated, never internal. */
export function usePublicTrustDocuments() {
  return useQuery({
    queryKey: ['trust', 'documents'],
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: '/trust/documents',
          responseSchema: trustDocumentListSchema,
          signal,
        })
      ).data.items,
  });
}

/** Every document, including internal ones, for the people who maintain the Trust Centre. */
export function useManagedTrustDocuments(workspaceSlug: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'settings/trust-documents'],
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/settings/trust-documents`,
          responseSchema: trustDocumentListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useRequestDocumentAccess(documentId: string) {
  return useMutation({
    mutationFn: async ({
      request,
      idempotencyKey,
    }: {
      request: AccessRequest;
      idempotencyKey: string;
    }) =>
      (
        await requestApi({
          method: 'POST',
          path: `/trust/documents/${encodeURIComponent(documentId)}/access-requests`,
          body: request,
          idempotencyKey,
          responseSchema: accessRequestReceiptSchema,
        })
      ).data,
  });
}
