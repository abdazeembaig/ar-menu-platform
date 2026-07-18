export type AnalyticsEventName =
  | "3d_button_clicked"
  | "model_load_started"
  | "model_load_completed"
  | "model_load_failed"
  | "first_model_interaction"
  | "fullscreen_opened"
  | "ar_button_clicked"
  | "ar_started"
  | "ar_failed"
  | "ar_unsupported";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  metadata?: Record<string, string | number | boolean | undefined>;
  timestamp: string;
}

interface AnalyticsSink {
  __arMenuAnalytics?: AnalyticsEvent[];
}

export function trackAnalyticsEvent(event: Omit<AnalyticsEvent, "timestamp">) {
  const payload: AnalyticsEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const sink = window as AnalyticsSink;
    sink.__arMenuAnalytics = sink.__arMenuAnalytics ?? [];
    sink.__arMenuAnalytics.push(payload);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", payload);
  }
}
