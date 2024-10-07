import express, { json } from 'express';
import Order from '../model/Eorder.js';
import puppeteer from "puppeteer";
import Emitter from "../emitter/orderemmiter.js";

import { logs } from '../model/configs.js';

const browser = await puppeteer.launch({ headless: true, devtools: false, args: ['--no-sandbox', '--disable-setuid-sandbox'], })
let emitter = new Emitter();

const port = 3000;
const app = express();

(async () => {
    app.use(json());

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get("/save", (req, res) => {

        logs.saveLog("Emit_server.csv")
        res.send("Log Saved in csv/Emit_server.csv")
    })

    app.post('/url', async (req, res) => {
        try {
            let data = req.body;
            if (data && data.url) {

                let order = new Order(data.url, browser);
                let orderPromise = new Promise(async (resolve, reject) => {
                    try {

                        await order.initialize();

                        order.resolve = resolve;
                        order.reject = reject;

                        emitter.emit('scrap', order);

                    } catch (err) {
                        console.log("Error during initialization: ", data.url, " Error: ", err);
                        reject(err);
                    }
                });
                await orderPromise;

                res.send({
                    id: order.id,
                    url: data.url,
                    timeTaken: order.time,
                    title: order.title,
                    code: order.code,
                    length: order.length,
                });

            } else {
                res.status(400).send('Invalid Request');
            }

        } catch (error) {
            console.log(`Error URL: ${error.message}`);

            res.status(500).send('Internal Error');

        }
    });

    app.listen(port, () => {
        console.log(`Server listening : ${port}`);
    });

})();
