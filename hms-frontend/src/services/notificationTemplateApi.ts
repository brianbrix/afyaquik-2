import { apiClient } from "./apiClient";
import type { NotificationTemplate } from "../types/notification";

export async function fetchNotificationTemplates() {
  const res = await apiClient.get("/admin/notification-templates");
  return res.data;
}

export async function createNotificationTemplate(payload: Partial<NotificationTemplate>) {
  const res = await apiClient.post("/admin/notification-templates", payload);
  return res.data;
}

export async function updateNotificationTemplate(id: number, payload: Partial<NotificationTemplate>) {
  const res = await apiClient.put(`/admin/notification-templates/${id}` , payload);
  return res.data;
}

export async function deleteNotificationTemplate(id: number) {
  const res = await apiClient.delete(`/admin/notification-templates/${id}`);
  return res.data;
}
