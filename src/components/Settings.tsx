import { Separator } from "@radix-ui/themes";
import { Notifications } from "./Notifications";
import { TokenForm } from "./TokenForm";

export function Settings() {
  return (
    <>
      <TokenForm />
      <Separator orientation={"horizontal"} size={"4"} />
      <Notifications />
    </>
  );
}
