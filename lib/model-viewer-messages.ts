export const MODEL_VIEWER_MESSAGE_SCOPE = "ar-menu:model-viewer";

export type ModelViewerToParentMessage =
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "MODEL_LOADING" }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "MODEL_PROGRESS"; payload: { progress: number } }
  | {
      scope: typeof MODEL_VIEWER_MESSAGE_SCOPE;
      type: "MODEL_READY";
      payload: { dimensions: { width: number; height: number; depth: number } };
    }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "MODEL_ERROR"; payload: { message: string } }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "AR_AVAILABLE"; payload: { available: boolean; reason?: string } }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "AR_STARTED"; payload?: { status?: string } }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "AR_FAILED"; payload: { message: string } }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "MODEL_INTERACTION" };

export type ParentToModelViewerMessage =
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "RESET_CAMERA" }
  | { scope: typeof MODEL_VIEWER_MESSAGE_SCOPE; type: "OPEN_AR" };

export function isModelViewerMessage(value: unknown): value is ModelViewerToParentMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as { scope?: unknown; type?: unknown };
  return message.scope === MODEL_VIEWER_MESSAGE_SCOPE && typeof message.type === "string";
}
