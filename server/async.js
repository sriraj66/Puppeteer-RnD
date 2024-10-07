import express, { json } from 'express';
import Order from '../model/Eorder.js';
import puppeteer from "puppeteer";
import scrap from "../emitter/orderasync.js";
import { logs } from '../model/configs.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// need to check
const cacheDir = path.join(__dirname, 'cache');

let ignoreFlags = [
    '--allow-pre-commit-input',
    // twek 2
    '--disable-background-networking',
    // '--disable-background-timer-throttling',
    // '--disable-backgrounding-occluded-windows',

    // tweek1
    // '--disable-breakpad', 
    '--disable-client-side-phishing-detection',
    // '--disable-component-extensions-with-background-pages',
    // '--disable-component-update',
    // '--disable-default-apps',

    '--disable-dev-shm-usage',

    // '--disable-extensions', 
    // '--disable-hang-monitor',
    // '--disable-infobars', 
    // '--disable-ipc-flooding-protection',
    // '--disable-popup-blocking',
    // '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-search-engine-choice-screen',
    // '--disable-sync',
    '--enable-automation',
    '--export-tagged-pdf',
    '--generate-pdf-document-outline',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--password-store=basic',
    '--use-mock-keychain',
    '--enable-features=PdfOopif', //no i18n
    // headless
    '--hide-scrollbars', '--mute-audio', //no i18n
]

let flags = [
    '--no-sandbox', //no i18n
    '--disable-setuid-sandbox', //no i18n

    // Default
    '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', //no i18n
    '--accept-lang=en-GB,en-US,en', //no i18n

    // Anti-Ban Support
    '--disable-blink-features=AutomationControlled', //no i18n
    '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4', //no i18n
    '--window-size=1920,1080', //no i18n
    '--ozone-override-screen-size=1920,1200', //no i18n

    // GPU
    '--use-angle=gl', //no i18n
    '--enable-angle-features', //no i18n
    '--use-gl=angle', //no i18n


    // CUSTOM

    '--disable-plugins',
    '--disable-breakpad',
    '--disable-translate',
    '--disable-stack-profiler',
    '--disable-logging',
    '--disable-translate-new-ux',
    '--disk-cache-size=0',
    '--disable-sync-preferences',  //disconect sync to google
    '--disable-translate-collapsing',
    '--no-first-run',
    '--no-experiments',
    '--disable-cloud-import',
    '--no-pings',

    '--no-default-browser-check',
    '--disable-bundled-ppapi-flash',
    '--disable-pinch',
    '--enable-fast-unload',
    '--disable-http2',


    '--enable-async-dns',
    '--enable-tcp-fastopen',
    '--disable-fetching-hints',

    '--disable-component-extensions-with-background-pages',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-infobars',
    '--disable-popup-blocking',

    '--disable-sync',

    // new
    '--disable-accelerated-2d-canvas',
    '--disable-notifications',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-ipc-flooding-protection',
    '--disable-renderer-backgrounding',
    '--enable-features=NetworkService,NetworkServiceInProcess',
    // '--single-process',
    '--no-zygote',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-skip-list',
    '--metrics-recording-only',
    // '--disable-dev-shm-usage'

]


let browser = await puppeteer.launch({
    headless: true,
    userDataDir: "./temp",
    devtools: false,
    // acceptInsecureCerts: true,
    args: flags,
    ignoreDefaultArgs: ignoreFlags,
})


const port = 3004;
const app = express();

(async () => {
    app.use(json());

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get("/save", (req, res) => {
        let filename = "shm.csv"
        logs.saveLog(filename)
        res.send("Log Saved in csv/" + filename)
    })

    app.post('/url', async (req, res) => {
        try {
            let data = req.body;

            if (data && data.url) {

                let order = new Order(data.url, browser);
                await order.initialize();
                await scrap(order);

                res.send({
                    id: order.id,
                    url: data.url,
                    timeTaken: order.time,
                    title: order.title,
                    code: order.code,
                    length: order.length,
                    renderTime: order.renderTime
                });

            } else {
                res.status(400).send({ error: 'Invalid request' });
            }

        } catch (error) {
            console.error(`Error while processing URL: ${error}`);
            // 1-> browser closed

            if (browser == undefined || !browser.connected) {
                res.status(500).send({ error: error.message, id: 1 });
                process.exit()
            }
            res.status(500).send({ error: error.message });

        }
    });

    app.listen(port, () => {
        console.log(`Server listening : ${port}`);
    });

})();


// TAKE LOG OF ALL