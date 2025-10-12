export type NotificationLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface NotificationTemplate {
  id: number;
  code: string;
  name: string;
  level: NotificationLevel;
  content: string;
  variables: string; // comma-separated
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}
