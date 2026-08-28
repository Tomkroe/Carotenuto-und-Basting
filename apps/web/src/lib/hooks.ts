"use client";

import { useQuery } from "@tanstack/react-query";
import type { MeResponse } from "@maklerprogram/types";
import { apiFetch } from "./api";

export function useCurrentUser() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => apiFetch<MeResponse>("/users/me"),
    retry: false,
  });
}
