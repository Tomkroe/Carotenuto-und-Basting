"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateObjektRequest, MeResponse, Objekt } from "@maklerprogram/types";
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
