import { Tabs as RadixTabs } from "@radix-ui/themes";
import { useGitlabToken } from "../lib/gitlab";
import { useHasUnread } from "../lib/status";
import { CheckboxIcon, GearIcon, RocketIcon } from "@radix-ui/react-icons";

export function Tabs({
  Todos,
  Settings,
  MergeRequests
}: {
  Todos: React.ReactNode;
  Settings: React.ReactNode;
  MergeRequests: React.ReactNode;
}) {
  const { token } = useGitlabToken();
  const canMakeRequests = token.length > 1;

  const defaultTab = canMakeRequests ? TODOS_TAB : SETTINGS_TAB;
  return (
    <RadixTabs.Root defaultValue={defaultTab}>
      <RadixTabs.List
        className={"sticky top-0 z-[1] bg-[var(--color-page-background)]"}
      >
        <RadixTabs.Trigger
          className={"disabled:opacity-60"}
          disabled={!canMakeRequests}
          value={TODOS_TAB}
        >
          <div className={"relative flex items-center gap-2"}>
            <CheckboxIcon />
            <span>Todos</span>
            <UnreadIndicator />
          </div>
        </RadixTabs.Trigger>
        <RadixTabs.Trigger value={MERGE_REQUESTS_TAB}>
          <div className={"flex items-center gap-2"}>
            <RocketIcon />
            <span>MRs</span>
          </div>
        </RadixTabs.Trigger>
        <RadixTabs.Trigger value={SETTINGS_TAB}>
          <div className={"flex items-center gap-2"}>
            <GearIcon />
            <span>Settings</span>
          </div>
        </RadixTabs.Trigger>
      </RadixTabs.List>
      <RadixTabs.Content value={TODOS_TAB} className={"flex-1"}>
        {Todos}
      </RadixTabs.Content>
      <RadixTabs.Content value={MERGE_REQUESTS_TAB} className={"flex-1"}>
        {MergeRequests}
      </RadixTabs.Content>
      <RadixTabs.Content value={SETTINGS_TAB} className={"flex-1"}>
        {Settings}
      </RadixTabs.Content>
    </RadixTabs.Root>
  );
}

const TODOS_TAB = "todos";
const SETTINGS_TAB = "settings";
const MERGE_REQUESTS_TAB = "mergeRequests";

const UnreadIndicator = () => {
  const hasNewItems = useHasUnread();
  if (!hasNewItems) {
    return;
  }

  return (
    <div className="absolute inline-flex items-center justify-center w-3 h-3 text-xs top-[-6px] right-[-16px] bg-red-500 border-2 border-white rounded-full dark:border-gray-900"></div>
  );
};
