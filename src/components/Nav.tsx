import { useHasUnreadTodos } from "../lib/todos-status";
import { useHasUnreadMRs } from "../lib/mrs-status";
import { Link, useMatch } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { CheckboxIcon, GearIcon, RocketIcon } from "@radix-ui/react-icons";

export function Nav() {
  const todosTabActive = useMatch("/todos") != null;
  const mrsTabActive = useMatch("/mrs") != null;
  const settingsTabActive = useMatch("/settings") != null;

  return (
    <nav
      className={
        "sticky top-0 bg-[var(--color-page-background)] p-1 border-[var(--gray-a5)] border-b z-[1]"
      }
    >
      <ol className={"flex flex-row gap-2"}>
        <li className={"flex items-center justify-center"}>
          <Button
            className={"data-[active='false']:bg-[transparent]"}
            data-active={todosTabActive}
            variant={"soft"}
            asChild={true}
          >
            <Link to="/todos">
              <div className={"relative flex items-center gap-2"}>
                <CheckboxIcon />
                <span>Todos</span>
                <TodosUnreadIndicator />
              </div>
            </Link>
          </Button>
        </li>
        <li className={"flex items-center justify-center"}>
          <Button
            className={"data-[active='false']:bg-[transparent]"}
            data-active={mrsTabActive}
            variant={"soft"}
          >
            <Link to="/mrs">
              <div className={"relative flex items-center gap-2"}>
                <RocketIcon />
                <span>MRs</span>
                <MRsUnreadIndicator />
              </div>
            </Link>
          </Button>
        </li>
        <li className={"flex items-center justify-center"}>
          <Button
            data-active={settingsTabActive}
            className={"data-[active='false']:bg-[transparent]"}
            variant={"soft"}
          >
            <Link to="/settings">
              <div className={"flex items-center gap-2"}>
                <GearIcon />
                <span>Settings</span>
              </div>
            </Link>
          </Button>
        </li>
      </ol>
    </nav>
  );
}

const TodosUnreadIndicator = () => {
  const hasUnreadTodos = useHasUnreadTodos();
  if (!hasUnreadTodos) {
    return;
  }

  return <UnreadIndicator />;
};

const MRsUnreadIndicator = () => {
  const hasUnreadMRs = useHasUnreadMRs();
  if (!hasUnreadMRs) {
    return;
  }

  return <UnreadIndicator />;
};

const UnreadIndicator = () => {
  return (
    <div className="absolute inline-flex items-center justify-center w-3 h-3 text-xs top-[-6px] right-[-10px] bg-red-500 border-2 border-white rounded-full dark:border-gray-900"></div>
  );
};
