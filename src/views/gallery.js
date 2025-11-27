import { Lightbox } from "../js/lBoxLogic";

export class GalleryView {
    constructor(element) {
        this.mountPoint = element;
        this.lightbox = null;
    }
    render() {
        this.lightbox = new Lightbox(this.mountPoint);
        this.lightbox.addImages({name: "land9.webp", alt: "A field full of pink flowers."},"land1.jpg", "land2.jpg", "land3.jpg", "land4.jpg", "land5.webp", "land6.webp", {name: "land7.webp", alt: "Green grass."}, "land8.webp");
    }
    destroy() {
        if (this.lightbox) {
            this.lightbox.removeEventListeners();
        }
        this.mountPoint.innerHTML = "";
    }
}