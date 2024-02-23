import { HttpResponse, http } from "msw";
import { setupWorker } from "msw/browser";

const existing: any[] = [];

const handlers: Parameters<typeof setupWorker> = [
  http.get("*/api/v4/todos", () => {
    return HttpResponse.json(existing);
  })
];

export const worker = setupWorker(...handlers);
