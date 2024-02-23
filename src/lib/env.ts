import { object, parse, string } from "valibot";

const EnvSchema = object({
  VITE_GITLAB_TOKEN: string()
});

export function getEnv() {
  return parse(EnvSchema, import.meta.env);
}
