import { getData, errorTemplate } from "../js/helpers";

export class IndexView {
    constructor(element) {
        this.mountPoint = element;
    }
    async render() {
        const url = "../templates/index.html"
        let htmlTemplate = await getData(url);

        if (htmlTemplate.error) {
            htmlTemplate = errorTemplate(cntTemplate.error, url);
        }
        this.mountPoint.innerHTML = htmlTemplate;
    }
    destroy() {
        this.mountPoint.innerHTML = "";
    }
}