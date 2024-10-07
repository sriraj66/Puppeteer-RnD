export default class Order {
    constructor(url, browser) {
        this.url = url;
        this.browser = browser;
        this.context = null;
        this.page = null;
        this.title = "";
        this.length = 0;
        this.code = 0;
    }

    async initialize() {
        this.context = await this.browser.createBrowserContext();
        this.page = await this.context.newPage();
    }

    timeStramp() {
        let now = new Date();
        return now.toString() + " " + now.getMilliseconds() + "ms";
    }

    setLength(len) {
        this.length = len;
    }

    getUrl() {
        return this.url;
    }

    setTitle(title) {
        this.title = title;
    }

    setCode(code) {
        this.code = code;
    }

    getPage() {
        return this.page;
    }

    getContext() {
        return this.context;
    }

    log(msg) {
        console.log(this.timeStramp(), " Title : ", this.title, " URL : ", this.url, "MSG : ", msg);
    }

    logEnd() {
        console.log(this.timeStramp(), " Code : ", this.code, " Title : ", this.title || "Not Fetched", " Length : ", this.length);
    }
}
