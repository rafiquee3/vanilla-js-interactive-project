export class Menu {
    static LEVEL_1 = "level1";
    static LEVEL_2 = "level2"; 
    static ACTION_CLICK = "click";
    static ACTION_HOVER = "mouseover";

    constructor(menuElement, opts) {
        this.menuElement = menuElement;
        this.menuToggle = this.menuElement.querySelector(".menu-toggle");
        this.allMenuToggles = [...this.menuElement.querySelectorAll("[data-list-id]")];
        this.navbarButtons = [...this.menuElement.querySelectorAll("button.menu-link")];
        this.navbarLinks = [...this.menuElement.querySelectorAll("a.menu-link")];
        this.allLists = {
            [Menu.LEVEL_1]: [...this.menuElement.querySelectorAll(".nestedLevel1")],
            [Menu.LEVEL_2]: [...this.menuElement.querySelectorAll(".nestedLevel2")],
        }
        const defaultOpts = {
            transitionTiming: window.getComputedStyle(document.documentElement).getPropertyValue("--nav-transition-timing"),
            action: Menu.ACTION_HOVER,
        };
        this.currentOpenLink = null;
        this.currentOpenButton = null;
        this.isNavMenuOpen = false;
        this.options = {...defaultOpts, ...opts};
        this.init();
    }
    init() {
        document.documentElement.style.setProperty('--nav-transition-timing', `${this.options.transitionTiming}`);
        document.addEventListener(`${this.options.action}`, (e) => {
            const target = e.target;
            const isInsideMenu = target.closest(".menu-list");
            const isMenuToggle = target.closest(".menu-toggle");
            const isNavbarButton = this.navbarButtons.includes(target);
            const isNavbarLink = target.classList.contains("menu-link") && target.tagName == "A";
            const isMenuSiteLink = target.closest(".menu-site-link");
            const isMenuLvl1Link = target.closest(`[aria-controls]`);
            const isMenuLvl1element = target.parentElement?.dataset.level == "1";
            const isClickedOutside = !e.target.closest(".menu-list");
            if (isMenuSiteLink) {
            
            }
            if (isMenuToggle) {
                console.log("zamykam")
                const toggleButton = this.menuToggle;
                this.closeAll();
                this.toggleMainMenu(toggleButton);
                return;
            }
            if (isInsideMenu) {
                if (isNavbarButton) {
                    const button = e.target;
                    this.toggleLevel1(button);
                    return;
                }
                if (isMenuLvl1Link || isMenuLvl1element) { 
                    const link = e.target;
                    this.toggleLevel2(link);
                    return;       
                }
                if(isNavbarLink) { 
                    const link = e.target;
                    this.closeAll();
                    this.#toggleStyle(link, true);
                    this.currentOpenLink = link;
                    return;
                }                                 
            }
            //Clicking an element outside the navbar.
            if (isClickedOutside && (this.isNavMenuOpen || this.currentOpenButton || this.currentOpenLink)) {
                this.closeAll();
                if (this.isNavMenuOpen) {
                    this.toggleMainMenu(this.menuToggle);
                }
            }
        });     
    }   
    #toggleStyle(element, isActive) {
        if (element) {
            if (isActive) {
                element.classList.add("is-active");
                element.setAttribute('aria-expanded', 'true');
            } else {
                element.classList.remove("is-active");
                element.setAttribute('aria-expanded', 'false');
            }
        }
    }   
    #closeLists(level) {
        if (level == Menu.LEVEL_1) {
            this.allLists[Menu.LEVEL_1].forEach(list => {
                list.classList.add("hidden");
                const buttonId = list.id;
                const button = this.allMenuToggles.find(toggle => toggle.dataset.listId == buttonId);
                this.#toggleStyle(button, false);
            })
        } else if (level == Menu.LEVEL_2) {      
            this.allLists[Menu.LEVEL_2].forEach(list => {
                list.classList.add("hidden");
                const linkId = list.id;
                const link = this.allMenuToggles.find(toggle => toggle.dataset.listId == linkId);
                this.#toggleStyle(link, false);
            })
            this.currentOpenLink = null;
        }
    }
    //Calculates the correct list positioning relative to its on-screen location
    #calcListPositioning(list) {
        const windowWidth = window.innerWidth; 
        const {right} = list.getBoundingClientRect();
        if (right > windowWidth) {
            if (list.closest(".nestedLevel2")) {
                list.style = "left: -100%;";
            } else {
                const overflowValue = windowWidth - right;
                list.style = `left: ${parseInt(overflowValue)}px;`;
            }
        }
    }
    #clearPositioningValues(list) {
        if (list.style.removeProperty) {
            list.style.removeProperty('left');
        } else {
            list.style.removeAttribute('left');
        }  
    }
    closeAll() {
        this.currentOpenButton = null;
        this.currentOpenLink = null;
        this.#closeLists(Menu.LEVEL_1);
        this.#closeLists(Menu.LEVEL_2);   
        this.navbarLinks.forEach(a => a.classList.remove("is-active"));
    }
    toggleMainMenu(toggleButton) {
        this.isNavMenuOpen = !this.isNavMenuOpen;
        const navbarMenu = this.menuElement.querySelector(".menu-wrapper");
        
        navbarMenu.classList.toggle("hidden", !this.isNavMenuOpen);
        this.#toggleStyle(toggleButton, this.isNavMenuOpen);
    }
    toggleLevel1(clickedButton) {
        const listId = clickedButton.dataset.listId;
        const listToToggle = this.menuElement.querySelector(`#${listId}`);
        this.#clearPositioningValues(listToToggle);
        if (clickedButton == this.currentOpenButton) {
            this.closeAll(); 
        } 
        else {
            this.closeAll(); 
            listToToggle.classList.remove("hidden");
            this.#toggleStyle(clickedButton, true);
            this.#calcListPositioning(listToToggle);
            this.currentOpenButton = clickedButton;
        }
    }
    toggleLevel2(clickedLink) {
        const listId = clickedLink.dataset.listId;
        const listToToggle = this.menuElement.querySelector(`#${listId}`);

        if (listToToggle) {
            this.#clearPositioningValues(listToToggle);
        }  
        if (clickedLink == this.currentOpenLink) {
            this.#closeLists(Menu.LEVEL_2); 
            this.#toggleStyle(clickedLink, false);
            this.currentOpenLink = null;
        } 
        else {
            this.#closeLists(Menu.LEVEL_2);
            if (listToToggle) {
                listToToggle.classList.remove("hidden");
                this.#toggleStyle(clickedLink, true);
                this.#calcListPositioning(listToToggle);
            }
            this.currentOpenLink = clickedLink;
        }
    }
}