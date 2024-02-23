import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from "@tauri-apps/api/notification";
import { useState } from "react";
import { useFadeToggle } from "../lib/useFadeToggle";

export function Notifications() {
  const { data: permissionGranted } = useSuspenseQuery({
    queryKey: ["notificationsPermissions"],
    queryFn: async () => {
      return await isPermissionGranted();
    }
  });

  return (
    <section className={"p-4 flex flex-col gap-2"}>
      <Heading size={"4"}>Push notifications</Heading>
      {permissionGranted ? (
        <Flex gap={"2"} className={"flex-col"}>
          <TestNotifications />
          <DisableNotifications />
        </Flex>
      ) : (
        <RequestPermissions />
      )}
    </section>
  );
}

function DisableNotifications() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <fieldset>
        <Button
          variant={"surface"}
          className={"block text-center w-full"}
          color={"red"}
        >
          Disable notifications
        </Button>
      </fieldset>
    </form>
  );
}

function TestNotifications() {
  const { fadeToggle, ref, isAnimating } = useFadeToggle();

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        sendNotification({
          title: "This is a test notification",
          body: "Test notification body"
        });

        void fadeToggle();
      }}
    >
      <fieldset>
        <Button className={"w-full grid"}>
          <span
            ref={ref}
            aria-hidden={!isAnimating}
            style={{ opacity: 0 }}
            className={"row-[1] col-[1] text-center"}
          >
            Notification sent!
          </span>
          <span
            aria-hidden={isAnimating}
            style={{ opacity: isAnimating ? 0 : 1 }}
            className={"row-[1] col-[1]"}
          >
            Send test notification
          </span>
        </Button>
      </fieldset>
    </form>
  );
}

function RequestPermissions() {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const permission = await requestPermission();
        if (permission === "granted") {
          return setError(null);
        }

        setError(
          "Permissions denied. Please adjust your browser/system settings"
        );
      }}
    >
      <fieldset>
        <Button className={"mx-auto block w-full text-center"}>
          Enable notifications
        </Button>
      </fieldset>
      {error ? (
        <Text size={"2"} color={"red"}>
          {error}
        </Text>
      ) : null}
    </form>
  );
}
