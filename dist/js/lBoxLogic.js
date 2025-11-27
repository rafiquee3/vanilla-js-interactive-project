import { delay } from "../../src/js/helpers";
export class Lightbox {
    constructor(element, opts) {
        const defaultOpts = {
            prevText: "<",
            nextText: ">",
            closeText: "X",
            title: "Gallery",
            outsideClick: false,
        }
        this.options = {...defaultOpts, ...opts};
        this.mountPoint = element;
        this.#createLightBox();
        this.#queryDomElement(); 
        this.#bindEventListeners();
        this.uniqueImageFileNames = []; 
        this.galleryImageElements = [];   
        this.thumbnailElements = [];
        this.currentIndex = -1;
        this.thumbnailsPerView = 5;
    }
    async #createLightBox() {
        const response = await fetch('/views/gallery.html');
        if (!response.ok) {
            this.mountPoint.innerHTML = "<div>Error loading template.</div>";
            return;
        }
        const templateHtml = await response.text();
        this.mountPoint.innerHTML = templateHtml;
    }
    #queryDomElement() {
        this.container = this.mountPoint.querySelector(".lightbox-cnt");
        this.title = this.mountPoint.querySelector(".title");
        this.galleryContainer = this.mountPoint.querySelector(".lightbox-gallery-cnt");
        this.galleryImgList = this.mountPoint.querySelector(".lightbox-gallery-img-list");
        this.lightbox = this.container.querySelector(".lightbox-box-cnt");
        this.lightboxCounter = this.lightbox.querySelector(".lightbox-box-count");
        this.lightboxImgContainer = this.lightbox.querySelector(".lightbox-box-img-cnt");
        this.prevBttn = this.lightbox.querySelector(".lightbox-box-prev");
        this.nextBttn = this.lightbox.querySelector(".lightbox-box-next");
        this.closeBttn = this.lightbox.querySelector(".lightbox-box-close");
        this.lightboxImgList = this.lightbox.querySelector(".lightbox-box-thumbnails-list");
        this.lightboxImg = this.lightbox.querySelector(".lightbox-box-img");
        this.lightboxText = this.lightbox.querySelector(".lightbox-box-text");
        this.imgLoadingIndicator = this.lightboxImgContainer.querySelector(".lightbox-img-loading");
        this.title.innerText = this.options.title;
        this.prevBttn.innerText = this.options.prevText;
        this.nextBttn.innerText = this.options.nextText;
        this.closeBttn.innerText = this.options.closeText;
    }
    #bindEventListeners() {
        document.addEventListener("keydown", (e) => this.#handleKeydown(e));
        this.prevBttn.addEventListener("click", () => this.prevImg());
        this.nextBttn.addEventListener("click", () => this.nextImg());
        this.closeBttn.addEventListener("click", () => this.toggleLightbox());
        this.lightbox.addEventListener("click", (e) => {
            if (e.target === e.currentTarget && this.options.outsideClick) {
                this.toggleLightbox();
            }
        });
        this.lightboxImgList.addEventListener("click", (e) => this.#handleClick(e, "lightbox"))
        this.galleryImgList.addEventListener("click", (e) => this.#handleClick(e, "gallery"));
        this.lightboxImg.addEventListener("load", () => this.imgLoadingIndicator.classList.add("hidden"));
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
    #handleClick(e, context) {
        if (e.target.tagName != "IMG") {
            return;
        }
        const img = e.target;
        if (context === "gallery") {
            this.toggleLightbox();
            this.showImage(img);
        }
        if (context === "lightbox") {
            this.showImage(img);
        }
    }
    #renderGalleryImages() {
        this.galleryImgList.innerHTML = '';
        this.galleryImageElements = [];
        this.uniqueImageFileNames.forEach(item => {
            const liElement = document.createElement("li");
            const imgElement = document.createElement("img");
            imgElement.src = "images/" + item.fileName;
            imgElement.alt = item.altText;
            imgElement.classList.add("lightbox-gallery-img");
            this.galleryImageElements.push(imgElement);
            liElement.appendChild(imgElement);
            this.galleryImgList.appendChild(liElement);
        })
    }
    #renderThumbnails() {
        this.lightboxImgList.innerHTML = '';     
        this.thumbnailElements = [];
        this.uniqueImageFileNames.forEach(item => {
            const liElement = document.createElement("li");
            const imgElement = document.createElement("img");
            imgElement.src = "images/" + item.fileName;
            imgElement.alt = item.altText;
            imgElement.classList.add("lightbox-thumbnail-img");
            this.thumbnailElements.push(imgElement);
            liElement.appendChild(imgElement);
            this.lightboxImgList.appendChild(liElement);
        })
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
        const thumbnailWidth = 100;
        const offset = windowStart * thumbnailWidth;
        this.lightboxImgList.style.transform = `translateX(-${offset}px)`;
    }
    addImages(...fileNames) {
        const graphicExt = ["jpg", "jpeg", "gif", "svg", "png", "avif", "webp", "bmp"];
        const processedData = [];
        
        fileNames.forEach((item, i)  => {
            const isObjectFormat = fileNames.length > 0 && typeof fileNames[i] === 'object' && fileNames[0] !== null;
            let name;
            let alt = "";
            if (isObjectFormat) {
                if (item.name) {
                    name = item.name;
                    console.log("alt",item.name.substring(0, item.name.lastIndexOf('.')) )
                    alt = item.alt || name.substring(0, name.lastIndexOf('.'));
                } else {
                    return;
                }
            } else {
                name = item;
                alt = name.substring(0, name.lastIndexOf('.'));
            }
            const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
            const isValidImage = graphicExt.includes(ext);
            if (isValidImage) {
                processedData.push({ 
                    fileName: name, 
                    altText: alt 
                });
            }
        })
        const uniqueProcessedData = this.#getUniqueData(processedData);
        this.uniqueImageFileNames = [...uniqueProcessedData];
        this.#renderGalleryImages();
        this.#renderThumbnails();
    }
    removeImage(fileName) {
        const isImageInArray = this.uniqueImageFileNames.find(file => file.fileName === fileName);
        if (isImageInArray) {
            this.uniqueImageFileNames =  this.uniqueImageFileNames.filter(file => file.fileName != fileName);
            this.#renderGalleryImages();
            this.#renderThumbnails();
        }
    }
    #getUniqueData(data) {
        const map = new Map();
        data.forEach(item => map.set(item.fileName, item));
        return Array.from(map.values());
    }
    async toggleLightbox() { 
        const isOpen = !this.lightbox.classList.contains("hidden");
        if (isOpen) {
            this.lightbox.classList.add("is-fading");
            await delay(450);
            this.lightbox.classList.remove("is-fading");
            this.lightbox.classList.add("hidden");
        } else {
            this.lightbox.classList.remove("hidden"); 
        };
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
            await delay(250);
            this.lightboxImg.src = "images/" + imageData.fileName;
            this.lightboxImg.alt = imageData.altText;
            this.lightboxImg.classList.remove('is-fading');
            this.lightboxCounter.textContent = 
                `${this.currentIndex + 1}/${this.uniqueImageFileNames.length}`;
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
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}