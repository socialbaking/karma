import {runPath} from "./paths";


export async function client() {

    await Promise.all([
        runPath(),
        runGlobal()
    ]);
}

async function runGlobal() {
    menu();
}

function menu() {

    const backdrop = document.getElementById("sidebar-backdrop");
    const backdropTransition = transition({
        element: backdrop,
        entering: "transition-opacity ease-linear duration-300",
        enteringFrom: "opacity-0",
        enteringTo: "opacity-100",
        leaving: "transition-opacity ease-linear duration-300",
        leavingFrom: "opacity-100",
        leavingTo: "opacity-0",
    })

    const closeButton = document.getElementById("sidebar-close-button");
    const closeButtonTransition = transition({
        element: closeButton,
        entering: "ease-in-out duration-300",
        enteringFrom: "opacity-0",
        enteringTo: "opacity-100",
        leaving: "ease-in-out duration-300",
        leavingFrom: "opacity-100",
        leavingTo: "opacity-0",
    });

    const menu = document.getElementById("sidebar-menu");
    const menuTransition = transition({
        element: menu,
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
        element: Element;
        entering: string;
        enteringFrom: string;
        enteringTo: string;
        leaving: string;
        leavingFrom: string;
        leavingTo: string;
    }
    
    function transition(event: TransitionEvent) {
        const { element } = event;
        const entering = event.entering.split(" ");
        const enteringFrom = event.enteringFrom.split(" ");
        const enteringTo = event.enteringTo.split(" ");
        const leaving = event.leaving.split(" ");
        const leavingFrom = event.leavingFrom.split(" ");
        const leavingTo = event.leavingTo.split(" ");
        return {
            entering() {
                element.classList.remove(...leaving.filter(value => entering.includes(value)));
                element.classList.remove(...enteringFrom);
                element.classList.add(...entering);
                element.classList.add(...enteringTo);
            },
            leaving() {
                element.classList.remove(...entering.filter(value => leaving.includes(value)));
                element.classList.remove(...leavingFrom);
                element.classList.add(...leaving);
                element.classList.add(...leavingTo);
            },
            leave() {
                const add = leaving.filter(value => value !== "transition");
                element.classList.remove(...entering);
                element.classList.remove(...enteringTo);
                element.classList.remove(...leavingFrom);
                element.classList.add(...add);
            }
        } as const;
    }

    function openButtonEvents() {
        const element = document.getElementById("sidebar-open-button");
        element.addEventListener("click", open);
    }

    function closeButtonEvents() {
        closeButton.addEventListener("click", close);
    }

    function open() {
        console.log("entering");
        backdropTransition.entering();
        closeButtonTransition.entering();
        menuTransition.entering();
    }

    function close() {
        backdropTransition.leaving();
        closeButtonTransition.leaving();
        menuTransition.leaving();
    }

    function reset() {
        backdropTransition.leave();
        closeButtonTransition.leave();
        menuTransition.leave();
    }
}