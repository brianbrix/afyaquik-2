import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import type { FormEvent, ReactNode } from "react";

export type FormModalProps = {
  show: boolean;
  title: string;
  onHide: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  description?: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  submitVariant?: string;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  error?: unknown;
  size?: "sm" | "lg" | "xl";
  bodyClassName?: string;
  footer?: ReactNode;
};

const DEFAULT_SUBMIT_LABEL = "Save";
const DEFAULT_CANCEL_LABEL = "Cancel";

function getErrorMessage(error: unknown): string {
  if (!error) {
    return "";
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "An unexpected error occurred";
  }
}

export function FormModal({
  show,
  title,
  onHide,
  onSubmit,
  children,
  description,
  submitLabel = DEFAULT_SUBMIT_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  submitVariant = "primary",
  isSubmitting = false,
  disableSubmit = false,
  error,
  size,
  bodyClassName,
  footer
}: FormModalProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <Modal show={show} onHide={onHide} centered size={size} backdrop="static">
      <Form onSubmit={onSubmit} className="d-flex flex-column">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={bodyClassName}>
          {description && <p className="text-muted mb-3">{description}</p>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {children}
        </Modal.Body>
        <Modal.Footer>
          {footer ?? (
            <>
              <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                variant={submitVariant}
                disabled={isSubmitting || disableSubmit}
                className="d-inline-flex align-items-center gap-2"
              >
                {isSubmitting && <Spinner animation="border" size="sm" role="status" aria-hidden="true" />}
                <span>{isSubmitting ? "Saving…" : submitLabel}</span>
              </Button>
            </>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
