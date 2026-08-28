"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateEinheitRequest,
  CreateKommentarRequest,
  CreateKontaktRequest,
  CreateObjektRequest,
  CreateToDoRequest,
  CreateVorgangRequest,
  Einheit,
  Kommentar,
  Kontakt,
  MeResponse,
  Objekt,
  ToDo,
  UpdateVorgangRequest,
  Vorgang,
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

export function useVorgaenge() {
  return useQuery<Vorgang[]>({
    queryKey: ["vorgaenge"],
    queryFn: () => apiFetch<Vorgang[]>("/vorgaenge"),
  });
}

export function useVorgang(id: string) {
  return useQuery<Vorgang>({
    queryKey: ["vorgaenge", id],
    queryFn: () => apiFetch<Vorgang>(`/vorgaenge/${id}`),
    enabled: !!id,
  });
}

export function useCreateVorgang() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVorgangRequest) =>
      apiFetch<Vorgang>("/vorgaenge", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
    },
  });
}

export function useUpdateVorgang(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateVorgangRequest) =>
      apiFetch<Vorgang>(`/vorgaenge/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", id] });
    },
  });
}

export function useDeleteVorgang() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/vorgaenge/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
    },
  });
}

export function useTodos(vorgangId: string) {
  return useQuery<ToDo[]>({
    queryKey: ["vorgaenge", vorgangId, "todos"],
    queryFn: () => apiFetch<ToDo[]>(`/vorgaenge/${vorgangId}/todos`),
    enabled: !!vorgangId,
  });
}

export function useCreateTodo(vorgangId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateToDoRequest) =>
      apiFetch<ToDo>(`/vorgaenge/${vorgangId}/todos`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", vorgangId, "todos"] });
    },
  });
}

export function useToggleTodo(vorgangId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, erledigt }: { id: string; erledigt: boolean }) =>
      apiFetch<ToDo>(`/todos/${id}`, { method: "PATCH", body: JSON.stringify({ erledigt }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", vorgangId, "todos"] });
    },
  });
}

export function useDeleteTodo(vorgangId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/todos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", vorgangId, "todos"] });
    },
  });
}

export function useKommentare(vorgangId: string) {
  return useQuery<Kommentar[]>({
    queryKey: ["vorgaenge", vorgangId, "kommentare"],
    queryFn: () => apiFetch<Kommentar[]>(`/vorgaenge/${vorgangId}/kommentare`),
    enabled: !!vorgangId,
  });
}

export function useCreateKommentar(vorgangId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKommentarRequest) =>
      apiFetch<Kommentar>(`/vorgaenge/${vorgangId}/kommentare`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", vorgangId, "kommentare"] });
    },
  });
}
