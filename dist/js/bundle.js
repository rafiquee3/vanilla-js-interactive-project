(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/js/navLogic.js
  var Menu;
  var init_navLogic = __esm({
    "src/js/navLogic.js"() {
      Menu = class _Menu {
        static LEVEL_1 = "level1";
        static LEVEL_2 = "level2";
        static ACTION_CLICK = "click";
        static ACTION_MOUSEOVER = "mouseover";
        constructor(menuElement, opts) {
          this.menuElement = menuElement;
          this.menuToggle = this.menuElement.querySelector(".menu-toggle");
          this.allMenuToggles = [...this.menuElement.querySelectorAll("[data-list-id]")];
          this.navbarButtons = [...this.menuElement.querySelectorAll("button.menu-link")];
          this.navbarLinks = [...this.menuElement.querySelectorAll("a.menu-link")];
          this.allLists = {
            [_Menu.LEVEL_1]: [...this.menuElement.querySelectorAll(".nestedLevel1")],
            [_Menu.LEVEL_2]: [...this.menuElement.querySelectorAll(".nestedLevel2")]
          };
          const defaultOpts = {
            transitionTiming: window.getComputedStyle(document.documentElement).getPropertyValue("--nav-transition-timing"),
            action: _Menu.ACTION_HOVER
          };
          this.currentOpenLink = null;
          this.currentOpenButton = null;
          this.isNavMenuOpen = false;
          this.options = { ...defaultOpts, ...opts };
          this.init();
        }
        init() {
          document.documentElement.style.setProperty("--nav-transition-timing", `${this.options.transitionTiming}`);
          this.menuElement.addEventListener("click", (e) => {
            const target = e.target;
            const isNavLinkInDropdown = target.tagName === "A" && target.closest(".innerList") && target.hasAttribute("href");
            if (isNavLinkInDropdown) {
              this.closeAll();
            }
          });
          document.addEventListener(`${this.options.action}`, (e) => {
            const target = e.target;
            const isInsideMenu = target.closest(".menu-list");
            const isMenuToggle = target.closest(".menu-toggle");
            const isNavbarButton = this.navbarButtons.includes(target);
            const isNavbarLink = target.classList.contains("menu-link") && target.tagName == "A";
            const isMenuLvl1LinkToLvl2 = target.closest(`[aria-controls]`);
            const isMenuLvl1element = target.parentElement?.dataset.level === "1";
            const isClickedOutside = !e.target.closest(".menu-list");
            const mouseOverBehavior = this.options.action == _Menu.ACTION_MOUSEOVER && target.classList.contains("is-active");
            if (isMenuToggle) {
              const toggleButton = this.menuToggle;
              this.closeAll();
              this.toggleMainMenu(toggleButton);
              return;
            }
            if (isInsideMenu) {
              if (mouseOverBehavior) {
                return;
              }
              if (isNavbarButton) {
                const button = e.target;
                this.toggleLevel1(button);
                return;
              }
              if (isMenuLvl1LinkToLvl2 || isMenuLvl1element) {
                const link = e.target;
                this.toggleLevel2(link);
                return;
              }
              if (isNavbarLink) {
                const link = e.target;
                this.closeAll();
                this.#toggleStyle(link, true);
                this.currentOpenLink = link;
                if (this.isMobileView()) {
                  this.toggleMainMenu(this.menuToggle);
                }
                return;
              }
            }
            if (isClickedOutside && (this.isNavMenuOpen || this.currentOpenButton || this.currentOpenLink)) {
              this.closeAll();
              if (this.isNavMenuOpen) {
                this.toggleMainMenu(this.menuToggle);
              }
            }
          });
        }
        isMobileView() {
          const mobileBreakpoint = "(max-width: 1023px)";
          return window.matchMedia(mobileBreakpoint).matches;
        }
        #toggleStyle(element, isActive) {
          if (element) {
            if (isActive) {
              element.classList.add("is-active");
              element.setAttribute("aria-expanded", "true");
            } else {
              element.classList.remove("is-active");
              element.setAttribute("aria-expanded", "false");
            }
          }
        }
        #closeLists(level) {
          if (level == _Menu.LEVEL_1) {
            this.allLists[_Menu.LEVEL_1].forEach((list) => {
              list.classList.add("hidden");
              const buttonId = list.id;
              const button = this.allMenuToggles.find((toggle) => toggle.dataset.listId == buttonId);
              this.#toggleStyle(button, false);
            });
          } else if (level == _Menu.LEVEL_2) {
            this.allLists[_Menu.LEVEL_2].forEach((list) => {
              list.classList.add("hidden");
              const linkId = list.id;
              const link = this.allMenuToggles.find((toggle) => toggle.dataset.listId == linkId);
              this.#toggleStyle(link, false);
            });
            this.currentOpenLink = null;
          }
        }
        //Calculates the correct list positioning relative to its on-screen location
        #calcListPositioning(list) {
          const windowWidth = window.innerWidth;
          const { right } = list.getBoundingClientRect();
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
            list.style.removeProperty("left");
          } else {
            list.style.removeAttribute("left");
          }
        }
        closeAll() {
          this.currentOpenButton = null;
          this.currentOpenLink = null;
          this.#closeLists(_Menu.LEVEL_1);
          this.#closeLists(_Menu.LEVEL_2);
          this.navbarLinks.forEach((a) => a.classList.remove("is-active"));
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
          } else {
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
            this.#closeLists(_Menu.LEVEL_2);
            this.#toggleStyle(clickedLink, false);
            this.currentOpenLink = null;
          } else {
            this.#closeLists(_Menu.LEVEL_2);
            if (listToToggle) {
              listToToggle.classList.remove("hidden");
              this.#toggleStyle(clickedLink, true);
              this.#calcListPositioning(listToToggle);
            }
            this.currentOpenLink = clickedLink;
          }
        }
      };
    }
  });

  // src/js/helpers.js
  async function getData(url2) {
    try {
      const response = await fetch(url2);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} when fetching ${url2}`);
      }
      const result = await response.text();
      return result;
    } catch (error) {
      console.error("Error loading data:", error.message);
      return {
        error
      };
    }
  }
  function errorTemplate(mssg, url2) {
    const template = `
        <div style="padding: 20px; text-align: center; color: red;">
                    <h2>View Load Error</h2>
                    <p>Could not load the requested view (${url2}).</p>
                    <p>Details: ${mssg}</p>
        </div>
    `;
    return template;
  }
  var init_helpers = __esm({
    "src/js/helpers.js"() {
    }
  });

  // src/views/index.js
  var IndexView;
  var init_views = __esm({
    "src/views/index.js"() {
      init_helpers();
      IndexView = class {
        constructor(element) {
          this.mountPoint = element;
        }
        async render() {
          const url2 = "../templates/index.html";
          let htmlTemplate = await getData(url2);
          if (htmlTemplate.error) {
            htmlTemplate = errorTemplate(cntTemplate.error, url2);
          }
          this.mountPoint.innerHTML = htmlTemplate;
        }
        destroy() {
          this.mountPoint.innerHTML = "";
        }
      };
    }
  });

  // src/js/lBoxLogic.js
  var Lightbox;
  var init_lBoxLogic = __esm({
    "src/js/lBoxLogic.js"() {
      Lightbox = class _Lightbox {
        static CONTEXT = { gallery: "gallery", lightbox: "lightbox" };
        constructor(element, opts) {
          const defaultOpts = {
            prevText: "<",
            nextText: ">",
            closeText: "X",
            title: "Gallery",
            outsideClick: true
          };
          this.options = { ...defaultOpts, ...opts };
          this.mountPoint = element;
          this.#createLightBox();
          this.#queryDomElement();
          this.#bindEventListeners();
          this.uniqueImageFileNames = [];
          this.galleryImageElements = [];
          this.thumbnailElements = [];
          this.currentIndex = -1;
          this.thumbnailsPerView = 4;
        }
        #createLightBox() {
          this.mountPoint.innerHTML = `
            <div class="lightbox-cnt">
                <div class="lightbox-gallery-cnt">
                    <h1>${this.options.title}</h1>
                    <ul class="lightbox-gallery-img-list">                
                    </ul>
                </div>
            </div>
        `;
          const lightboxHtml = `
                <div class="lightbox-box-cnt hidden">
                    <div class="lightbox-box-count"></div>
                    <div class="lightbox-box-img-cnt">
                        <button class="lightbox-box-prev">
                            ${this.options.prevText}
                        </button>
                        <button class="lightbox-box-next">
                            ${this.options.nextText}
                        </button>
                        <img class="lightbox-box-img" alt="">
                        <div class="lightbox-img-loading"></div>
                    </div>
                    <div class="lightbox-box-text">
                    </div>
                    <div class="lightbox-box-thumbnails">
                        <ul class="lightbox-box-thumbnails-list">
                        </ul>
                    </div>
                    <button class="lightbox-box-close">
                        ${this.options.closeText}
                    </button>
                </div>
        `;
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = lightboxHtml.trim();
          const lightboxElement = tempDiv.firstChild;
          document.body.appendChild(lightboxElement);
        }
        #queryDomElement() {
          this.container = this.mountPoint.querySelector(".lightbox-cnt");
          this.galleryContainer = this.mountPoint.querySelector(".lightbox-gallery-cnt");
          this.galleryImgList = this.mountPoint.querySelector(".lightbox-gallery-img-list");
          this.lightbox = document.querySelector(".lightbox-box-cnt");
          this.lightboxCounter = this.lightbox.querySelector(".lightbox-box-count");
          this.lightboxImgContainer = this.lightbox.querySelector(".lightbox-box-img-cnt");
          this.prevBttn = this.lightbox.querySelector(".lightbox-box-prev");
          this.nextBttn = this.lightbox.querySelector(".lightbox-box-next");
          this.closeBttn = this.lightbox.querySelector(".lightbox-box-close");
          this.lightboxImgList = this.lightbox.querySelector(".lightbox-box-thumbnails-list");
          this.lightboxImg = this.lightbox.querySelector(".lightbox-box-img");
          this.lightboxText = this.lightbox.querySelector(".lightbox-box-text");
          this.imgLoadingIndicator = this.lightboxImgContainer.querySelector(".lightbox-img-loading");
        }
        #bindEventListeners() {
          this.boundHandleClickGallery = this.#handleClick.bind(this, _Lightbox.CONTEXT.gallery);
          this.boundHandleClickLightbox = this.#handleClick.bind(this, _Lightbox.CONTEXT.lightbox);
          this.boundHandlePrevBttn = this.#handlePrevBttn.bind(this);
          this.boundHandleNextBttn = this.#handleNextBttn.bind(this);
          this.boundHandleCloseBttn = this.#handleCloseBttn.bind(this);
          this.boundHandleClickOutsideOpt = this.#handleClickOutsideOpt.bind(this);
          this.boundHandleLoadIndicator = this.#handleLoadIndicator.bind(this);
          this.boundHandleKeydown = this.#handleKeydown.bind(this);
          document.addEventListener("keydown", this.boundHandleKeydown);
          this.prevBttn.addEventListener("click", this.boundHandlePrevBttn);
          this.nextBttn.addEventListener("click", this.boundHandleNextBttn);
          this.closeBttn.addEventListener("click", this.boundHandleCloseBttn);
          this.lightbox.addEventListener("click", this.boundHandleClickOutsideOpt);
          this.lightboxImgList.addEventListener("click", this.boundHandleClickLightbox);
          this.galleryImgList.addEventListener("click", this.boundHandleClickGallery);
          this.lightboxImg.addEventListener("load", this.boundHandleLoadIndicator);
        }
        removeEventListeners() {
          document.removeEventListener("keydown", this.boundHandleKeydown);
          if (this.prevBttn) this.prevBttn.removeEventListener("click", this.boundHandlePrevBttn);
          if (this.nextBttn) this.nextBttn.removeEventListener("click", this.boundHandleNextBttn);
          if (this.closeBttn) this.closeBttn.removeEventListener("click", this.boundHandleCloseBttn);
          if (this.lightbox) this.lightbox.removeEventListener("click", this.boundHandleClickOutsideOpt);
          if (this.lightboxImgList) this.lightboxImgList.removeEventListener("click", this.boundHandleClickLightbox);
          if (this.galleryImgList) this.galleryImgList.removeEventListener("click", this.boundHandleClickGallery);
          if (this.lightboxImg) this.lightboxImg.removeEventListener("load", this.boundHandleLoadIndicator);
        }
        #handlePrevBttn() {
          this.prevImg();
        }
        #handleNextBttn() {
          this.nextImg();
        }
        #handleCloseBttn() {
          this.toggleLightbox();
        }
        #handleClickOutsideOpt(e) {
          if (e.target === e.currentTarget && this.options.outsideClick) {
            this.toggleLightbox();
          }
        }
        #handleLoadIndicator() {
          this.imgLoadingIndicator.classList.add("hidden");
        }
        #handleKeydown(e) {
          const isOpen = !this.lightbox.classList.contains("hidden");
          if (!isOpen) {
            return;
          }
          switch (e.key) {
            case "Escape":
              e.preventDefault();
              this.toggleLightbox();
              break;
            case "ArrowLeft":
              e.preventDefault();
              this.prevImg();
              break;
            case "ArrowRight":
              e.preventDefault();
              this.nextImg();
              break;
            default:
              return;
          }
        }
        #handleClick(context, e) {
          if (e.target.tagName != "IMG") {
            return;
          }
          const img = e.target;
          if (context === _Lightbox.CONTEXT.gallery) {
            this.toggleLightbox();
            this.showImage(img);
          }
          if (context === _Lightbox.CONTEXT.lightbox) {
            this.showImage(img);
          }
        }
        #renderGalleryImages() {
          this.galleryImgList.innerHTML = "";
          this.galleryImageElements = [];
          this.uniqueImageFileNames.forEach((item) => {
            const liElement = document.createElement("li");
            const imgElement = document.createElement("img");
            imgElement.src = "images/" + item.fileName;
            imgElement.alt = item.altText;
            imgElement.classList.add("lightbox-gallery-img");
            this.galleryImageElements.push(imgElement);
            liElement.appendChild(imgElement);
            this.galleryImgList.appendChild(liElement);
          });
        }
        #renderThumbnails() {
          this.lightboxImgList.innerHTML = "";
          this.thumbnailElements = [];
          this.uniqueImageFileNames.forEach((item) => {
            const liElement = document.createElement("li");
            const imgElement = document.createElement("img");
            imgElement.src = "images/" + item.fileName;
            imgElement.alt = item.altText;
            imgElement.classList.add("lightbox-thumbnail-img");
            this.thumbnailElements.push(imgElement);
            liElement.appendChild(imgElement);
            this.lightboxImgList.appendChild(liElement);
          });
        }
        #updateThumbnailCarousel() {
          const activeIndex = this.currentIndex;
          const totalThumbnails = this.thumbnailElements.length;
          if (totalThumbnails === 0) return;
          let windowStart = activeIndex - Math.floor(this.thumbnailsPerView / 2);
          if (windowStart < 0) {
            windowStart = 0;
          }
          if (windowStart > totalThumbnails - this.thumbnailsPerView) {
            windowStart = totalThumbnails - this.thumbnailsPerView;
          }
          const thumbnailWidth = 80;
          const offset = windowStart * thumbnailWidth;
          this.lightboxImgList.style.transform = `translateX(-${offset}px)`;
        }
        addImages(...fileNames) {
          const graphicExt = ["jpg", "jpeg", "gif", "svg", "png", "avif", "webp", "bmp"];
          const processedData = [];
          fileNames.forEach((item, i) => {
            const isObjectFormat = fileNames.length > 0 && typeof fileNames[i] === "object" && fileNames[0] !== null;
            let name;
            let alt = "";
            if (isObjectFormat) {
              if (item.name) {
                name = item.name;
                alt = item.alt || name.substring(0, name.lastIndexOf("."));
              } else {
                return;
              }
            } else {
              name = item;
              alt = name.substring(0, name.lastIndexOf("."));
            }
            const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
            const isValidImage = graphicExt.includes(ext);
            if (isValidImage) {
              processedData.push({
                fileName: name,
                altText: alt
              });
            }
          });
          const uniqueProcessedData = this.#getUniqueData(processedData);
          this.uniqueImageFileNames = [...uniqueProcessedData];
          this.#renderGalleryImages();
          this.#renderThumbnails();
        }
        removeImage(fileName) {
          const isImageInArray = this.uniqueImageFileNames.find((file) => file.fileName === fileName);
          if (isImageInArray) {
            this.uniqueImageFileNames = this.uniqueImageFileNames.filter((file) => file.fileName != fileName);
            this.#renderGalleryImages();
            this.#renderThumbnails();
          }
        }
        #getUniqueData(data) {
          const map = /* @__PURE__ */ new Map();
          data.forEach((item) => map.set(item.fileName, item));
          return Array.from(map.values());
        }
        async toggleLightbox() {
          const isOpen = !this.lightbox.classList.contains("hidden");
          if (isOpen) {
            this.lightbox.classList.add("is-fading");
            await this.#delay(450);
            this.lightbox.classList.remove("is-fading");
            this.lightbox.classList.add("hidden");
          } else {
            this.lightbox.classList.remove("hidden");
          }
          ;
        }
        async showImage(image) {
          let index;
          const isFromGallery = this.galleryImageElements.includes(image);
          if (isFromGallery) {
            index = this.galleryImageElements.indexOf(image);
          } else {
            index = this.thumbnailElements.indexOf(image);
          }
          if (index === -1) {
            index = this.currentIndex;
          }
          this.currentIndex = index;
          this.thumbnailElements.forEach((img, i) => {
            img.classList.toggle("is-active", i === this.currentIndex);
          });
          const imageData = this.uniqueImageFileNames[this.currentIndex];
          if (imageData) {
            this.lightboxImg.classList.add("is-fading");
            await this.#delay(250);
            this.lightboxImg.src = "images/" + imageData.fileName;
            this.lightboxImg.alt = imageData.altText;
            this.lightboxImg.classList.remove("is-fading");
            this.lightboxCounter.textContent = `${this.currentIndex + 1}/${this.uniqueImageFileNames.length}`;
            this.lightboxText.textContent = imageData.altText;
          }
          this.#updateThumbnailCarousel();
        }
        prevImg() {
          this.currentIndex--;
          if (this.currentIndex < 0) {
            this.currentIndex = this.thumbnailElements.length - 1;
          }
          const img = this.thumbnailElements[this.currentIndex];
          this.showImage(img);
        }
        nextImg() {
          this.currentIndex++;
          if (this.currentIndex > this.thumbnailElements.length - 1) {
            this.currentIndex = 0;
          }
          const img = this.thumbnailElements[this.currentIndex];
          this.showImage(img);
        }
        #delay(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
      };
    }
  });

  // src/views/gallery.js
  var GalleryView;
  var init_gallery = __esm({
    "src/views/gallery.js"() {
      init_lBoxLogic();
      GalleryView = class {
        constructor(element) {
          this.mountPoint = element;
          this.lightbox = null;
        }
        render() {
          this.lightbox = new Lightbox(this.mountPoint);
          this.lightbox.addImages({ name: "land9.webp", alt: "A field full of pink flowers." }, "land1.jpg", "land2.jpg", "land3.jpg", "land4.jpg", "land5.webp", "land6.webp", { name: "land7.webp", alt: "Green grass." }, "land8.webp");
        }
        destroy() {
          if (this.lightbox) {
            this.lightbox.removeEventListeners();
          }
          this.mountPoint.innerHTML = "";
        }
      };
    }
  });

  // src/views/FormStore.js
  var FormStore;
  var init_FormStore = __esm({
    "src/views/FormStore.js"() {
      FormStore = {
        forms: {},
        currentStep: 1,
        currentProgressLiElement: null,
        getStepData(stepNumber) {
          return this.forms[`step-${stepNumber}`] || null;
        },
        setStepData(stepNumber, stepObject) {
          this.forms[`step-${stepNumber}`] = stepObject;
        },
        setCurrentStep(stepNumber) {
          this.currentStep = stepNumber;
        },
        setCurrentProgressLiElement(currentProgressLiElement) {
          this.currentProgressLiElement = currentProgressLiElement;
        }
      };
    }
  });

  // src/js/formLogic.js
  var Form, isValidName, isValidEmail, isValidAge, step1FormValidateFN, isValidStreetAddress, isValidCity, isValidZipCode, isValidCountry, step2FormValidateFN, isValidNewPassword, isValidConfirmPassword, isValidDataSharing, step3FormValidateFN;
  var init_formLogic = __esm({
    "src/js/formLogic.js"() {
      init_FormStore();
      Form = class {
        constructor(formElement) {
          this.form = formElement;
          this.data = {};
          this.validationRules = {};
          this.errors = {};
          this.fields = {};
          this.isSubmitted = false;
          this.#initData();
          this.#bindEventListeners();
        }
        #initData() {
          [...this.form.elements].forEach((element) => {
            if (element.name) {
              if (element.type === "checkbox") {
                this.data[element.name] = element.checked;
              }
              if (element.type === "radio" && element.checked) {
                this.data[element.name] = element.value;
              } else if (element.type !== "radio") {
                this.data[element.name] = element.value;
              }
            }
          });
          this.form.setAttribute("novalidate", true);
        }
        updateDomReferences(newFormElement) {
          this.form = newFormElement;
          this.fields = {};
          this.errorSpans = {};
          this.form.querySelectorAll("[name]").forEach((element) => {
            const tagName = element.tagName.toLowerCase();
            if (tagName === "input") {
              element.setAttribute("autocomplete", "off");
            }
            if (tagName === "input" || tagName === "select" || tagName === "textarea") {
              this.fields[element.name] = element;
              const formGroup = element.closest(".form-group");
              if (formGroup) {
                const errorSpan = formGroup.querySelector(".error-message");
                if (errorSpan) {
                  this.errorSpans[element.name] = errorSpan;
                }
              }
            }
          });
          this.submitButton = this.form.querySelector('button[type="submit"]');
          this.form.setAttribute("novalidate", true);
          this.removeEventListeners();
          this.#bindEventListeners();
        }
        #bindEventListeners() {
          this.boundHandleInput = this.#handleInput.bind(this);
          this.boundHandleSubmit = this.#handleSubmit.bind(this);
          this.form.addEventListener("input", this.boundHandleInput);
          this.form.addEventListener("submit", this.boundHandleSubmit);
        }
        removeEventListeners() {
          this.form.removeEventListener("input", this.boundHandleInput);
          this.form.removeEventListener("submit", this.boundHandleSubmit);
        }
        setData(input, value) {
          if (input.type === "checkbox") {
            this.data[input.name] = input.checked;
          } else if (input.type === "radio") {
            this.data[input.name] = value;
          } else {
            this.data[input.name] = value;
          }
        }
        hydrateForm() {
          for (const name in this.data) {
            const value = this.data[name];
            if (value !== void 0) {
              const inputs = document.querySelectorAll(`[name="${name}"]`);
              if (inputs.length > 0 && inputs[0].type === "radio") {
                inputs.forEach((inputEl) => {
                  if (inputEl.type === "radio") {
                    inputEl.checked = inputEl.value === value;
                  }
                });
              } else {
                const input = this.fields[name];
                if (!input) continue;
                if (input.type === "checkbox") {
                  input.checked = value;
                } else if (input.tagName === "SELECT" && input.multiple) {
                } else {
                  input.value = value;
                }
              }
            }
          }
        }
        #handleInput(e) {
          this.isSubmitted = false;
          const input = e.target;
          this.setData(input, input.value);
          FormStore.currentProgressLiElement.classList.remove("is-valid");
          this.resetFieldStyle(input);
        }
        #handleSubmit(e) {
          e.preventDefault();
          this.isSubmitted = true;
        }
        renderValidationErrors() {
          for (const name in this.fields) {
            const input = this.fields[name];
            const errorElement = this.errorSpans[name] || input.nextElementSibling;
            if (errorElement && errorElement.classList.contains("error-message")) {
              const message = this.errors[name] || "";
              errorElement.textContent = message;
              input.classList.toggle("is-error", !!this.errors[name]);
              const formGroup = input.closest(".form-group");
              if (formGroup) {
                formGroup.classList.toggle("has-error", !!this.errors[name]);
              }
            }
          }
        }
        resetFieldStyle(input) {
          const hasError = input.classList.contains("is-error");
          const errorElement = this.errorSpans[input.name];
          if (hasError) {
            input.classList.remove("is-error");
            errorElement.textContent = "";
          }
        }
        clearValidationErrors() {
          this.errors = {};
          this.renderValidationErrors();
        }
        addRule(fieldName, rules) {
          this.validationRules[fieldName] = rules;
        }
        validate() {
          this.errors = {};
          let isValid = true;
          for (const fieldName in this.validationRules) {
            const rules = this.validationRules[fieldName];
            const elementValue = this.data[fieldName];
            for (const rule of rules) {
              const errorMsg = rule(elementValue, this.data);
              if (errorMsg) {
                this.errors[fieldName] = errorMsg;
                isValid = false;
                break;
              }
            }
          }
          return isValid;
        }
        isFormSubmitted() {
          return this.isSubmitted;
        }
        getErrors() {
          return this.errors;
        }
        getData() {
          const data = { ...this.data, ...this.requiredData };
          return data;
        }
        getValidationStatus() {
          const isValid = this.validate();
          return isValid;
        }
      };
      isValidName = (name) => {
        const regex = /^[a-zA-ZàâäæéèêëîïôœùûüÿçÀÂÄÆÉÈÊËÎÏÔŒÙÛÜŸÇ][\s\-\'a-zA-ZàâäæéèêëîïôœùûüÿçÀÂÄÆÉÈÊËÎÏÔŒÙÛÜŸÇ]{0,24}$/;
        if (regex.test(name)) {
          return null;
        } else {
          return "The given name contains invalid characters and must be 2-25 characters long.";
        }
      };
      isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (regex.test(email)) {
          return null;
        } else {
          return "The email address provided is invalid.";
        }
      };
      isValidAge = (age) => {
        if (age > 0 && age <= 120) {
          return null;
        } else {
          return "Invalid age entered.";
        }
      };
      step1FormValidateFN = {
        isValidName,
        isValidEmail,
        isValidAge
      };
      isValidStreetAddress = (address) => {
        if (!address || address.length < 5) {
          return "Street address is required and must be at least 5 characters long.";
        }
        const regex = /^[a-zA-Z0-9\s.,#'\-]{5,}$/;
        if (regex.test(address)) {
          return null;
        } else {
          return "The street address contains invalid characters.";
        }
      };
      isValidCity = (city) => {
        if (!city || city.trim() === "") {
          return "City is required.";
        }
        const regex = /^[a-zA-Z\u0080-\uFFFF\s\.\-']{2,}$/;
        if (regex.test(city)) {
          return null;
        } else {
          return "City name is invalid or too short.";
        }
      };
      isValidZipCode = (zipCode) => {
        const zipString = String(zipCode).trim();
        if (!zipString) {
          return "Zip/Postal Code is required.";
        }
        const regex = /^\d{5}$/;
        if (regex.test(zipString)) {
          return null;
        } else {
          return "Zip/Postal Code must be exactly 5 digits.";
        }
      };
      isValidCountry = (country) => {
        if (!country || country === "") {
          return "Please select a country.";
        }
        return null;
      };
      step2FormValidateFN = {
        isValidStreetAddress,
        isValidCity,
        isValidZipCode,
        isValidCountry
      };
      isValidNewPassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (regex.test(password)) {
          return null;
        } else {
          return "Password must be at least 8 characters long and contain letters and numbers.";
        }
      };
      isValidConfirmPassword = (confirmPassword, allFormData) => {
        const newPassword = allFormData.newPassword;
        if (!confirmPassword || confirmPassword.length === 0) {
          return "Password confirmation is required.";
        }
        if (confirmPassword !== newPassword) {
          return "The confirmation password does not match the new password.";
        }
        return null;
      };
      isValidDataSharing = (dataSharing) => {
        console.log("sharing out");
        if (!dataSharing || dataSharing !== "yes" && dataSharing !== "no") {
          console.log("sharing IN");
          return "Please select a data sharing preference.";
        }
        return null;
      };
      step3FormValidateFN = {
        isValidNewPassword,
        isValidConfirmPassword,
        isValidDataSharing
      };
    }
  });

  // src/views/form.js
  var updateUrlForStep, FormView;
  var init_form = __esm({
    "src/views/form.js"() {
      init_helpers();
      init_formLogic();
      init_FormStore();
      updateUrlForStep = (stepNuber) => {
        const currentURL = new URL(window.location);
        currentURL.searchParams.set("step", stepNuber);
        history.pushState({ step: stepNuber }, "", currentURL.toString());
      };
      FormView = class _FormView {
        static STEP_1 = "step-1";
        static STEP_2 = "step-2";
        static STEP_3 = "step-3";
        constructor(element) {
          this.mountPoint = element;
          this.currentForm = null;
          this.forms = null;
          this.step = 1;
          this.unlockState = {
            [_FormView.STEP_1]: false,
            [_FormView.STEP_2]: false,
            [_FormView.STEP_3]: false
          };
        }
        async render() {
          const urlFormCntTemplate = "../templates/form.html";
          this.step = FormStore.currentStep;
          this.forms = FormStore.forms;
          let cntTemplate2 = await getData(urlFormCntTemplate);
          if (cntTemplate2.error) {
            cntTemplate2 = errorTemplate(cntTemplate2.error, url);
          }
          this.mountPoint.innerHTML = cntTemplate2;
          this.formProgressElement = this.mountPoint.querySelector(".form-progress");
          updateUrlForStep(this.step);
          await this.renderForm();
          this.boundHandlePopstate = this.#handlePopstate.bind(this);
          window.addEventListener("popstate", this.boundHandlePopstate);
        }
        destroy() {
          this.mountPoint.innerHTML = "";
          window.removeEventListener("popstate", this.boundHandlePopstate);
          this.#removeEventListeners();
        }
        async renderForm() {
          const urlFormElementTemplate = `../templates/step${this.step}Form.html`;
          this.mobileQuery = window.matchMedia("(max-width: 1023px)");
          this.currentProgressLiElement = this.formProgressElement.querySelector(`.step-${this.step}`);
          FormStore.setCurrentProgressLiElement(this.currentProgressLiElement);
          let formWrapper = this.mountPoint.querySelector(".form-main-wrapper");
          let formTemplate = await getData(urlFormElementTemplate);
          if (formTemplate.error) {
            formTemplate = errorTemplate(formTemplate.error, urlFormElementTemplate);
          }
          formWrapper.innerHTML = formTemplate;
          this.form = this.mountPoint.querySelector("form");
          this.passwordToggleButton = this.form.querySelector("button.password-toggle") ? this.form.querySelector("button.password-toggle") : null;
          this.unlockState[`step-${this.step}`] = true;
          if (this.mobileQuery.matches) {
            this.#handleScreenChange({ matches: true });
          }
          this.#removeEventListeners();
          this.#addEventListeners();
          this.#formInit();
        }
        #addEventListeners() {
          this.boundHandleProgressClick = this.#handleProgressClick.bind(this);
          this.boundHandleSubmit = this.#handleSubmit.bind(this);
          this.boundTogglePasswordVisibility = this.togglePasswordVisibility.bind(this);
          this.boundHandleScreenChange = this.#handleScreenChange.bind(this);
          this.form.addEventListener("submit", this.boundHandleSubmit);
          this.mobileQuery.addEventListener("change", this.boundHandleScreenChange);
          this.formProgressElement.querySelectorAll("li").forEach((li) => li.addEventListener("click", this.boundHandleProgressClick));
          this.passwordToggleButton?.addEventListener("click", this.boundTogglePasswordVisibility);
        }
        #removeEventListeners() {
          this.form.removeEventListener("submit", this.boundHandleSubmit);
          this.formProgressElement.querySelectorAll("li").forEach((li) => li.removeEventListener("click", this.boundHandleProgressClick));
          this.passwordToggleButton?.removeEventListener("click", this.boundTogglePasswordVisibility);
          this.mobileQuery.removeEventListener("change", this.boundHandleScreenChange);
        }
        async #handleProgressClick(e) {
          const target = e.target;
          const previousStep = this.step;
          const classList = target.classList;
          const classArray = Array.from(classList);
          const stepMatch = classArray.find((cls) => cls.startsWith("step-"));
          if (stepMatch) this.step = parseInt(stepMatch.slice(5));
          const requestedStep = this.step;
          const isRequestedStepUnlocked = this.unlockState[`step-${this.step}`];
          const requestedForm = this.forms[`step-${requestedStep}`];
          const isCurrentFormValid = this.currentForm.data.getValidationStatus();
          const isCurrentFormSubmited = this.currentForm.data.isFormSubmitted();
          if (!isRequestedStepUnlocked || (!isCurrentFormSubmited || !isCurrentFormValid) && requestedStep > previousStep) {
            this.currentForm.data.renderValidationErrors();
            this.step = previousStep;
            return;
          }
          this.currentForm.data.clearValidationErrors();
          requestedForm.data.clearValidationErrors();
          FormStore.setCurrentStep(this.step);
          updateUrlForStep(this.step);
          await this.renderForm();
        }
        #handleScreenChange(e) {
          console.log("yes");
          const liElements = [...this.formProgressElement.children];
          const data = ["User Identification", "Delivery Address", "Privacy Settings"];
          if (e.matches) {
            liElements.forEach((li, i) => li.textContent = i + 1);
          } else {
            liElements.forEach((li, i) => li.textContent = data[i]);
          }
        }
        async #handleSubmit(e) {
          e.preventDefault();
          const isCurrentFormValid = this.currentForm.data.getValidationStatus();
          if (isCurrentFormValid) {
            if (this.step === 3) {
              alert("send data");
            }
            this.step++;
            this.currentProgressLiElement.classList.add("is-valid");
            FormStore.setCurrentStep(this.step);
            await this.renderForm();
          } else {
            this.currentForm.data.renderValidationErrors();
          }
        }
        async #handlePopstate(e) {
          let targetStep = 1;
          if (e.state && e.state.step) {
            targetStep = parseInt(e.state.step);
          } else {
            const params = new URLSearchParams(window.location.search);
            targetStep = parseInt(params.get("step")) || 1;
          }
          if (!this.unlockState[`step-${targetStep}`] && targetStep > 1) {
            history.pushState(null, "", `?step=${this.step}`);
            return;
          }
          this.step = targetStep;
          FormStore.setCurrentStep(this.step);
          return;
        }
        matchStyleToProgressElement() {
          this.formProgressElement.querySelectorAll("li").forEach((li) => li.classList.remove("is-active"));
          this.currentProgressLiElement.classList.add("is-active");
        }
        togglePasswordVisibility(e) {
          const toggleBttn = e.target;
          toggleBttn.classList.toggle("is-active");
          const showPassword = toggleBttn.classList.contains("is-active");
          const input = toggleBttn.closest(".password-wraper").querySelector(`input[type="password"], input[name="newPassword"]`);
          showPassword ? input.setAttribute("type", "text") : input.setAttribute("type", "password");
        }
        #formInit() {
          const hasBeenAdded = !!FormStore.getStepData(this.step);
          if (!hasBeenAdded) {
            const stepObject = {
              data: new Form(this.form)
            };
            FormStore.setStepData(this.step, stepObject);
          }
          this.matchStyleToProgressElement();
          const currentForm = FormStore.getStepData(this.step);
          this.currentForm = currentForm;
          this.currentForm.data.updateDomReferences(this.form);
          this.currentForm.data.hydrateForm();
          this.#addValidationRules();
        }
        #addValidationRules() {
          switch (this.step) {
            case 1:
              this.currentForm.data.addRule("name", [step1FormValidateFN.isValidName]);
              this.currentForm.data.addRule("lastName", [step1FormValidateFN.isValidName]);
              this.currentForm.data.addRule("email", [step1FormValidateFN.isValidEmail]);
              this.currentForm.data.addRule("age", [step1FormValidateFN.isValidAge]);
              break;
            case 2:
              this.currentForm.data.addRule("streetAddress", [step2FormValidateFN.isValidStreetAddress]);
              this.currentForm.data.addRule("city", [step2FormValidateFN.isValidCity]);
              this.currentForm.data.addRule("zipCode", [step2FormValidateFN.isValidZipCode]);
              this.currentForm.data.addRule("country", [step2FormValidateFN.isValidCountry]);
              break;
            case 3:
              this.currentForm.data.addRule("newPassword", [step3FormValidateFN.isValidNewPassword]);
              this.currentForm.data.addRule("confirmPassword", [step3FormValidateFN.isValidConfirmPassword]);
              this.currentForm.data.addRule("dataSharing", [step3FormValidateFN.isValidDataSharing]);
              break;
          }
        }
      };
    }
  });

  // src/js/router.js
  var routes, Router;
  var init_router = __esm({
    "src/js/router.js"() {
      init_views();
      init_gallery();
      init_form();
      routes = {
        "/": IndexView,
        "/gallery": GalleryView,
        "/form": FormView
      };
      Router = class {
        constructor(mainElement) {
          this.mainElement = mainElement;
          this.currentView = null;
          window.addEventListener("popstate", this.#route.bind(this));
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
          };
          if (document.startViewTransition) {
            document.startViewTransition(updateDOM);
          } else {
            updateDOM();
          }
        }
        navigate(url2) {
          window.history.pushState(null, null, url2);
          this.#route();
        }
        #eventLinkInterception() {
          document.body.addEventListener("click", (e) => {
            const link = e.target.closest("a");
            const currentPath = window.location.pathname;
            if (link && link.target !== "_blank") {
              const href = link.getAttribute("href");
              if (currentPath === href) {
                e.preventDefault();
                return;
              }
              ;
              if (href && routes[href]) {
                e.preventDefault();
                this.navigate(href);
              }
            }
          });
        }
      };
    }
  });

  // src/js/app.js
  var require_app = __commonJS({
    "src/js/app.js"() {
      init_navLogic();
      init_router();
      var menu = document.querySelector(".menu");
      var main = document.querySelector(".main-cnt");
      var nav = new Menu(menu, { transitionTiming: "0.5s", action: "click" });
      var router = new Router(main);
      router.init();
    }
  });
  require_app();
})();
