import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { randomMergeRequestAssignment, randomMergeRequestNote } from "./data";
import { MergeRequestNoteSchema, TodoSchema } from "@gitbeaker/rest";

const existingTodos: Array<TodoSchema> = [];

const existingNotesForMR = new Map<string, Array<MergeRequestNoteSchema>>();

const handlers: Parameters<typeof setupWorker> = [
  http.get("*/api/v4/todos", () => {
    existingTodos.unshift(randomMergeRequestAssignment());

    return HttpResponse.json(existingTodos);
  }),

  http.get(
    "*/api/v4/projects/:project_name/merge_requests/:mr_iid/notes",
    (req) => {
      const mrIid = req.params["mr_iid"];

      const existingNotes = existingNotesForMR.get(mrIid) ?? [];
      const newNotes = [...existingNotes, randomMergeRequestNote()];

      existingNotesForMR.set(mrIid, newNotes);

      return HttpResponse.json(newNotes);
    },
  ),
];

export const worker = setupWorker(...handlers);
