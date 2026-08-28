"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssistantAttachment,
  AssistantChatMessage,
  AssistantChatResponse,
  CreateEigentuemerschaftRequest,
  CreateEinheitRequest,
  CreateKommentarRequest,
  CreateKontaktRequest,
  CreateLabelRequest,
  CreateMietvertragRequest,
  CreateNebenkostenabrechnungRequest,
  CreateNebenkostenPositionRequest,
  CreateObjektRequest,
  CreateToDoRequest,
  CreateVorgangRequest,
  CreateZaehlerRequest,
  CreateZaehlerstandRequest,
  Dokument,
  Eigentuemerschaft,
  Einheit,
  EinheitListItem,
  Kommentar,
  Kontakt,
  Label,
  MeResponse,
  Mietvertrag,
  Nebenkostenabrechnung,
  NebenkostenPosition,
  Objekt,
  ToDo,
  UpdateEigentuemerschaftRequest,
  UpdateEinheitRequest,
  UpdateKontaktRequest,
  UpdateMietvertragRequest,
  UpdateNebenkostenabrechnungRequest,
  UpdateObjektRequest,
  UpdateVorgangRequest,
  UpdateZaehlerRequest,
  Vorgang,
  Zaehler,
  Zaehlerstand,
} from "@maklerprogram/types";
import { apiFetch, apiUpload } from "./api";

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

export function useUpdateObjekt(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateObjektRequest) =>
      apiFetch<Objekt>(`/objekte/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte"] });
      queryClient.invalidateQueries({ queryKey: ["objekte", id] });
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

export function useUpdateEinheit(objektId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEinheitRequest }) =>
      apiFetch<Einheit>(`/einheiten/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
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

export function useKontakt(id: string) {
  return useQuery<Kontakt>({
    queryKey: ["kontakte", id],
    queryFn: () => apiFetch<Kontakt>(`/kontakte/${id}`),
    enabled: !!id,
  });
}

export function useUpdateKontakt(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateKontaktRequest) =>
      apiFetch<Kontakt>(`/kontakte/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kontakte"] });
      queryClient.invalidateQueries({ queryKey: ["kontakte", id] });
    },
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

export type KommentarParent = { path: "vorgaenge" | "nebenkostenabrechnungen" | "kontakte"; id: string };

export function useKommentare(parent: KommentarParent) {
  return useQuery<Kommentar[]>({
    queryKey: [parent.path, parent.id, "kommentare"],
    queryFn: () => apiFetch<Kommentar[]>(`/${parent.path}/${parent.id}/kommentare`),
    enabled: !!parent.id,
  });
}

export function useCreateKommentar(parent: KommentarParent) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKommentarRequest) =>
      apiFetch<Kommentar>(`/${parent.path}/${parent.id}/kommentare`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [parent.path, parent.id, "kommentare"] });
    },
  });
}

export function useEinheitenFlat() {
  return useQuery<EinheitListItem[]>({
    queryKey: ["einheiten"],
    queryFn: () => apiFetch<EinheitListItem[]>("/einheiten"),
  });
}

export function useMietvertraege() {
  return useQuery<Mietvertrag[]>({
    queryKey: ["mietvertraege"],
    queryFn: () => apiFetch<Mietvertrag[]>("/mietvertraege"),
  });
}

export function useMietvertrag(id: string) {
  return useQuery<Mietvertrag>({
    queryKey: ["mietvertraege", id],
    queryFn: () => apiFetch<Mietvertrag>(`/mietvertraege/${id}`),
    enabled: !!id,
  });
}

export function useCreateMietvertrag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMietvertragRequest) =>
      apiFetch<Mietvertrag>("/mietvertraege", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mietvertraege"] });
    },
  });
}

export function useUpdateMietvertrag(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMietvertragRequest) =>
      apiFetch<Mietvertrag>(`/mietvertraege/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mietvertraege"] });
      queryClient.invalidateQueries({ queryKey: ["mietvertraege", id] });
    },
  });
}

export function useDeleteMietvertrag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/mietvertraege/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mietvertraege"] });
    },
  });
}

export type DokumentParent = {
  path: "mietvertraege" | "objekte" | "vorgaenge" | "nebenkostenabrechnungen" | "kontakte";
  id: string;
};

export function useDokumente(parent: DokumentParent) {
  return useQuery<Dokument[]>({
    queryKey: [parent.path, parent.id, "dokumente"],
    queryFn: () => apiFetch<Dokument[]>(`/${parent.path}/${parent.id}/dokumente`),
    enabled: !!parent.id,
  });
}

export function useUploadDokument(parent: DokumentParent) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<Dokument>(`/${parent.path}/${parent.id}/dokumente`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [parent.path, parent.id, "dokumente"] });
    },
  });
}

export function useDeleteDokument(parent: DokumentParent) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/dokumente/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [parent.path, parent.id, "dokumente"] });
    },
  });
}

export function useEigentuemerschaften() {
  return useQuery<Eigentuemerschaft[]>({
    queryKey: ["eigentuemerschaften"],
    queryFn: () => apiFetch<Eigentuemerschaft[]>("/eigentuemerschaften"),
  });
}

export function useCreateEigentuemerschaft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEigentuemerschaftRequest) =>
      apiFetch<Eigentuemerschaft>("/eigentuemerschaften", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eigentuemerschaften"] });
    },
  });
}

export function useUpdateEigentuemerschaft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEigentuemerschaftRequest }) =>
      apiFetch<Eigentuemerschaft>(`/eigentuemerschaften/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eigentuemerschaften"] });
    },
  });
}

export function useDeleteEigentuemerschaft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/eigentuemerschaften/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eigentuemerschaften"] });
    },
  });
}

export function useZaehlerListe() {
  return useQuery<Zaehler[]>({
    queryKey: ["zaehler"],
    queryFn: () => apiFetch<Zaehler[]>("/zaehler"),
  });
}

export function useZaehler(id: string) {
  return useQuery<Zaehler>({
    queryKey: ["zaehler", id],
    queryFn: () => apiFetch<Zaehler>(`/zaehler/${id}`),
    enabled: !!id,
  });
}

export function useCreateZaehler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateZaehlerRequest) =>
      apiFetch<Zaehler>("/zaehler", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zaehler"] });
    },
  });
}

export function useUpdateZaehler(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateZaehlerRequest) =>
      apiFetch<Zaehler>(`/zaehler/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zaehler"] });
      queryClient.invalidateQueries({ queryKey: ["zaehler", id] });
    },
  });
}

export function useDeleteZaehler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/zaehler/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zaehler"] });
    },
  });
}

export function useZaehlerstaende(zaehlerId: string) {
  return useQuery<Zaehlerstand[]>({
    queryKey: ["zaehler", zaehlerId, "zaehlerstaende"],
    queryFn: () => apiFetch<Zaehlerstand[]>(`/zaehler/${zaehlerId}/zaehlerstaende`),
    enabled: !!zaehlerId,
  });
}

export function useCreateZaehlerstand(zaehlerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateZaehlerstandRequest) =>
      apiFetch<Zaehlerstand>(`/zaehler/${zaehlerId}/zaehlerstaende`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zaehler", zaehlerId, "zaehlerstaende"] });
    },
  });
}

export function useDeleteZaehlerstand(zaehlerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/zaehlerstaende/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zaehler", zaehlerId, "zaehlerstaende"] });
    },
  });
}

export function useNebenkostenabrechnungen() {
  return useQuery<Nebenkostenabrechnung[]>({
    queryKey: ["nebenkostenabrechnungen"],
    queryFn: () => apiFetch<Nebenkostenabrechnung[]>("/nebenkostenabrechnungen"),
  });
}

export function useNebenkostenabrechnung(id: string) {
  return useQuery<Nebenkostenabrechnung>({
    queryKey: ["nebenkostenabrechnungen", id],
    queryFn: () => apiFetch<Nebenkostenabrechnung>(`/nebenkostenabrechnungen/${id}`),
    enabled: !!id,
  });
}

export function useCreateNebenkostenabrechnung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNebenkostenabrechnungRequest) =>
      apiFetch<Nebenkostenabrechnung>("/nebenkostenabrechnungen", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nebenkostenabrechnungen"] });
    },
  });
}

export function useUpdateNebenkostenabrechnung(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNebenkostenabrechnungRequest) =>
      apiFetch<Nebenkostenabrechnung>(`/nebenkostenabrechnungen/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nebenkostenabrechnungen"] });
      queryClient.invalidateQueries({ queryKey: ["nebenkostenabrechnungen", id] });
    },
  });
}

export function useDeleteNebenkostenabrechnung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/nebenkostenabrechnungen/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nebenkostenabrechnungen"] });
    },
  });
}

export function useNebenkostenPositionen(abrechnungId: string) {
  return useQuery<NebenkostenPosition[]>({
    queryKey: ["nebenkostenabrechnungen", abrechnungId, "positionen"],
    queryFn: () => apiFetch<NebenkostenPosition[]>(`/nebenkostenabrechnungen/${abrechnungId}/positionen`),
    enabled: !!abrechnungId,
  });
}

export function useCreateNebenkostenPosition(abrechnungId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNebenkostenPositionRequest) =>
      apiFetch<NebenkostenPosition>(`/nebenkostenabrechnungen/${abrechnungId}/positionen`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nebenkostenabrechnungen", abrechnungId, "positionen"] });
    },
  });
}

export function useDeleteNebenkostenPosition(abrechnungId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/positionen/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nebenkostenabrechnungen", abrechnungId, "positionen"] });
    },
  });
}

export function useLabels() {
  return useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: () => apiFetch<Label[]>("/labels"),
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLabelRequest) =>
      apiFetch<Label>("/labels", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/labels/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
    },
  });
}

export function useAttachLabel(vorgangId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => apiFetch<void>(`/vorgaenge/${vorgangId}/labels/${labelId}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", vorgangId] });
    },
  });
}

export function useDetachLabel(vorgangId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      apiFetch<void>(`/vorgaenge/${vorgangId}/labels/${labelId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
      queryClient.invalidateQueries({ queryKey: ["vorgaenge", vorgangId] });
    },
  });
}

export function useAssistantChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { messages: AssistantChatMessage[]; attachment?: AssistantAttachment }) =>
      apiFetch<AssistantChatResponse>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (data.actions.length > 0) {
        queryClient.invalidateQueries();
      }
    },
  });
}
