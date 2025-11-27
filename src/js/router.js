import { IndexView } from "../views/index";
import { GalleryView } from "../views/gallery";
import { FormView } from "../views/form";

const routes = {
    "/": IndexView,
    "/gallery": GalleryView,
    "/form": FormView,
};

export class Router {
    constructor(mainElement) {
        this.mainElement = mainElement;
        this.currentView = null;
        // handle prev next browser bttn
        window.addEventListener('popstate', this.#route.bind(this));
    }
    init() {
        this.#route();
        this.#eventLinkInterception();
    }
    async #route() {
        const path = window.location.pathname;
        const ViewClass = routes[path] || routes["/"];

        const updateDOM = () => {
            if (this.currentView && this.currentView.destroy) {
                this.currentView.destroy();
            }
            this.mainElement.innerHTML = "";
            
            const incomingView = document.createElement("div");
            incomingView.classList.add("view-cnt");
            this.mainElement.appendChild(incomingView); 
            
            if (ViewClass) {
                this.currentView = new ViewClass(incomingView);
                this.currentView.render();
            }
        }
        if (document.startViewTransition) {
            document.startViewTransition(updateDOM);
        } else {
            updateDOM();
        }
    }
    navigate(url) {
        /* It allows the user to use the browser's Back and Forward buttons to navigate between the different 
        "pages", update the URL shown in the browser's address bar to the new url. Does NOT Trigger a Page Reload.
        */
        window.history.pushState(null, null, url);
        this.#route();
    }
    #eventLinkInterception() {
        document.body.addEventListener('click', e => {
            const link = e.target.closest('a');
            const currentPath = window.location.pathname;
            if (link && link.target !== '_blank') {
                const href = link.getAttribute('href');
                if (currentPath === href) {
                    e.preventDefault(); 
                    return;
                };
                if (href && routes[href]) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });
    }
}