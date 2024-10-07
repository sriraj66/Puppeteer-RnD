import { timer } from "./configs.js";

export default class Order {
    constructor(url, browser, resolve = null, reject = null) {
        this.url = url;
        this.start = 0;
        timer.Torder++;
        this.id = timer.Torder;
        this.time = 0;
        this.browser = browser;
        this.context = null;
        this.page = null;
        this.title = "";
        this.length = 0;
        this.code = 0;
        this.write = false;
        this.resolve = resolve;
        this.reject = reject
        this.metrics = {}
        this.renderTime = 0
    }

    async initialize() {
        this.context = await this.browser.createBrowserContext();
        this.page = await this.context.newPage();
        await this.page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            isMobile: false
        })

        // tweek 3
        await this.page.setCacheEnabled(true);

        await this.page.setRequestInterception(true);
  
        this.page.on('request', req => {
            if (req.isInterceptResolutionHandled()) {
                return;
            }
    
            if (["stylesheet", "image", "media", "font"].includes(req.resourceType())) {
                console.log(`URL: ${req.url()} Aborted`);
                req.abort();
            } else {
                req.continue();
            }
        });


        this.page.setDefaultTimeout(30000);
        await this.page.emulateNetworkConditions({
            // offline: false,
            download: 500 * 125000,
            upload: 500 * 125000,
            latency: 0,
        });

        // tweek 3
        let client = await this.page.createCDPSession();

        await client.send('Animation.setPlaybackRate', { playbackRate: 0 });
        console.log('Animations disabled');
        await client.detach()

        this.log("Init Done")
        this.start = Date.now()
    }

    async takeScreenshot() {
        await this.page.screenshot({
            fullPage: true,
            // path:"s1.png"
        })
    }

    timeStramp() {
        let now = new Date();
        return now.toString() + " " + now.getMilliseconds() + "ms";
    }

    setLength(len) {
        this.length = len;
    }
    async CalcMetrics() {
        this.metrics = await this.page.metrics()
        this.metrics.renderTime = this.renderTime
    }

    async extractHTML5Content() {

        try {
            return await this.page.evaluate(() => {

                let doctype = document.doctype ?
                    `<!DOCTYPE ${document.doctype.name}${document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : ''}${document.doctype.systemId ? ' SYSTEM "' + document.doctype.systemId + '"' : ''}>` : '';
                debugger;
                function extractHTML(node) {
                    if (!node) return '';
                    if (node.nodeType === 3) return node.textContent;
                    if (node.nodeType !== 1) return '';

                    let html = '';
                    let outer = node.cloneNode();

                    if (node.shadowRoot) {
                        node = node.shadowRoot;
                    }

                    if (node.tagName && node.tagName.toLowerCase() === 'template') {
                        node = node.content;
                    }
                    if (node.tagName && node.tagName.toLowerCase() === 'iframe' && node.contentDocument) {
                        try {
                            let frameHTML = '';

                            let doc = node.contentDocument;
                            let frameContent = doc.documentElement;

                            let iframedoctype = doc.doctype ?
                                `<!DOCTYPE ${doc.doctype.name}${doc.doctype.publicId ? ' PUBLIC "' + doc.doctype.publicId + '"' : ''}${doc.doctype.systemId ? ' SYSTEM "' + doc.doctype.systemId + '"' : ''}>` : '';
                            frameHTML += iframedoctype + extractHTML(frameContent);

                            html = ` <iframe src="${node.src}"  id="${node.id || ''}" title="${node.title || ''}" name="${node.name || ''}" width="${node.width || ''}" height="${node.height || ''}" allow="${node.allow || ''}" sandbox="${node.sandbox || ''}" frameborder="${node.frameborder || ''}" allowfullscreen="${node.allowfullscreen || ''}" loading="${node.loading || ''}" referrerpolicy="${node.referrerpolicy || ''}" scrolling="${node.scrolling || ''}" style="${node.style.cssText || ''}" csp="${node.csp || ''}" allowpaymentrequest="${node.allowpaymentrequest || ''}" srcdoc="${node.srcdoc || ''}" >${frameHTML}</iframe>`;
                        } catch (e) {
                            console.error(e);

                        }
                        return html;
                    }

                    if (node.children.length) {
                        for (let n of node.childNodes) {
                            if (n.assignedNodes && n.assignedNodes().length > 0) {
                                html += extractHTML(n.assignedNodes()[0]);
                            } else {
                                html += extractHTML(n);
                            }
                        }
                    } else {
                        html = node.innerHTML;
                    }

                    outer.innerHTML = html;
                    return outer.outerHTML;
                }
                let result = extractHTML(document.documentElement);
                return doctype + result;
            });
        } catch (error) {
            logger.error(this.log(`Error in extractHTML5Content: ${error.message}`));
            throw error;
        }
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

    calcTime() {
        if (this.time == 0) {
            this.time = Date.now() - this.start;
            timer.Ttime += this.time
            timer.Forder++;
        }
        return this.getTime()
    }
    getTime() {
        return this.time
    }

    log(msg) {
        console.log(this.timeStramp(), "ID : ", this.id, " Title : ", this.title, " URL : ", this.url, "MSG : ", msg);
    }

    logTime(msg) {
        console.log(this.timeStramp(), "ID : ", this.id, " URL : ", this.url, "Time Taken : ", this.time, "ms :-> ", msg);

    }

    logEnd() {
        console.log(this.timeStramp(), "ID : ", this.id, " Code : ", this.code, " Title : ", this.title || "Not Fetched", " Length : ", this.length);

    }
}