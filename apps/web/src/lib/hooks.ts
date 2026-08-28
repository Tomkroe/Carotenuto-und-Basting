"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateEinheitRequest,
  CreateKontaktRequest,
  CreateObjektRequest,
  Einheit,
  Kontakt,
  MeResponse,
  Objekt,
} from "@maklerprogram/types";
import { apiFetch } from "./api";

export function useCurrentUser() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => apiFetch<MeResponse>("/users/me"),
    retry: false,
  });
}

export function useObjekte() {
  return useQuery<Objekt[]>({
    queryKey: ["objekte"],
    queryFn: () => apiFetch<Objekt[]>("/objekte"),
  });
}

export function useObjekt(id: string) {
  return useQuery<Objekt>({
    queryKey: ["objekte", id],
    queryFn: () => apiFetch<Objekt>(`/objekte/${id}`),
    enabled: !!id,
  });
}

export function useCreateObjekt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateObjektRequest) =>
      apiFetch<Objekt>("/objekte", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte"] });
    },
  });
}

export function useDeleteObjekt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/objekte/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte"] });
    },
  });
}

export function useEinheiten(objektId: string) {
  return useQuery<Einheit[]>({
    queryKey: ["objekte", objektId, "einheiten"],
    queryFn: () => apiFetch<Einheit[]>(`/objekte/${objektId}/einheiten`),
    enabled: !!objektId,
  });
}

export function useCreateEinheit(objektId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEinheitRequest) =>
      apiFetch<Einheit>(`/objekte/${objektId}/einheiten`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte", objektId, "einheiten"] });
    },
  });
}

export function useDeleteEinheit(objektId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/einheiten/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte", objektId, "einheiten"] });
    },
  });
}

export function useKontakte() {
  return useQuery<Kontakt[]>({
    queryKey: ["kontakte"],
    queryFn: () => apiFetch<Kontakt[]>("/kontakte"),
  });
}

export function useCreateKontakt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKontaktRequest) =>
      apiFetch<Kontakt>("/kontakte", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kontakte"] });
    },
  });
}

export function useDeleteKontakt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/kontakte/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kontakte"] });
    },
  });
}
