import { runPath } from "./paths";

export async function client() {
  await Promise.all([runPath(), runGlobal()]);
}

async function runGlobal() {
  hiddenNoScript();
  menu();
}

function hiddenNoScript() {
  // Remove hidden from any elements that were hidden
  // for js only functionality
  //
  // .hidden is the actual hiding class
  // .script-visible is our trigger to remove it
  const elements = document.querySelectorAll(".hidden.script-visible");
  elements.forEach((element) => {
    element.classList.remove("script-visible", "hidden");
  });
}

function menu() {
  const sidebar = transition({
    query: ".sidebar",
    entering: "relative z-50 lg:hidden",
    leaving: "hidden",
  });

  const backdropTransition = transition({
    query: ".sidebar-backdrop",
    entering: "transition-opacity ease-linear duration-300",
    enteringFrom: "opacity-0",
    enteringTo: "opacity-100",
    leaving: "transition-opacity ease-linear duration-300",
    leavingFrom: "opacity-100",
    leavingTo: "opacity-0",
  });

  const closeButtonTransition = transition({
    query: ".sidebar-close-button",
    entering: "ease-in-out duration-300",
    enteringFrom: "opacity-0",
    enteringTo: "opacity-100",
    leaving: "ease-in-out duration-300",
    leavingFrom: "opacity-100",
    leavingTo: "opacity-0",
  });

  const menuTransition = transition({
    query: ".sidebar-menu",
    entering: "transition ease-in-out duration-300 transform",
    enteringFrom: "-translate-x-full",
    enteringTo: "translate-x-0",
    leaving: "transition ease-in-out duration-300 transform",
    leavingFrom: "translate-x-0",
    leavingTo: "-translate-x-full",
  });

  openButtonEvents();
  closeButtonEvents();
  reset(); // Ensure its closed

  interface TransitionEvent {
    query: string;
    entering: string;
    enteringFrom?: string;
    enteringTo?: string;
    leaving: string;
    leavingFrom?: string;
    leavingTo?: string;
  }

  function transition(event: TransitionEvent) {
    const elements = document.querySelectorAll(event.query);
    const entering = event.entering.split(" ");
    const enteringFrom = event.enteringFrom?.split(" ") ?? [];
    const enteringTo = event.enteringTo?.split(" ") ?? [];
    const leaving = event.leaving.split(" ");
    const leavingFrom = event.leavingFrom?.split(" ") ?? [];
    const leavingTo = event.leavingTo?.split(" ") ?? [];
    return {
      entering() {
        elements.forEach((element) => {
          element.classList.remove(...leaving);
          element.classList.remove(...enteringFrom);
          element.classList.add(...entering);
          element.classList.add(...enteringTo);
        });
      },
      leaving() {
        elements.forEach((element) => {
          element.classList.remove(...entering);
          element.classList.remove(...leavingFrom);
          element.classList.add(...leaving);
          element.classList.add(...leavingTo);
        });
      },
      leave() {
        const add = leaving.filter((value) => value !== "transition");
        elements.forEach((element) => {
          element.classList.remove(...entering);
          element.classList.remove(...enteringTo);
          element.classList.remove(...leavingFrom);
          element.classList.add(...add);
        });
      },
    } as const;
  }

  function openButtonEvents() {
    const elements = document.querySelectorAll(".sidebar-open-button");
    elements.forEach((element) => {
      // Enable the button with javascript being available
      element.addEventListener("click", open);
    });
  }

  function closeButtonEvents() {
    const elements = document.querySelectorAll(".sidebar-close-button");
    elements.forEach((element) => {
      element.addEventListener("click", close);
    });
    const sidebar = document.querySelectorAll(".sidebar");
    sidebar.forEach((element) => {
      element.addEventListener("click", (event) => {
        if (
          event.target instanceof Element &&
          event.target.matches(".sidebar-contents, .sidebar-contents *")
        ) {
          return;
        }
        return close();
      });
    });
  }

  function open() {
    console.log("open");
    backdropTransition.entering();
    closeButtonTransition.entering();
    menuTransition.entering();
    sidebar.entering();
  }

  function close() {
    console.log("close");
    backdropTransition.leaving();
    closeButtonTransition.leaving();
    menuTransition.leaving();
    sidebar.leaving();
  }

  function reset() {
    backdropTransition.leave();
    closeButtonTransition.leave();
    menuTransition.leave();
    sidebar.leave();
  }
}
