import Order from "../model/Eorder.js";
import puppeteer from "puppeteer";
import scrap from "../emitter/orderasync.js";
import { open } from 'node:fs/promises';
import { logs } from "../model/configs.js";

const browser = await puppeteer.launch({ headless: true,devtools:false, args: ['--no-sandbox', '--disable-setuid-sandbox'], })


function app() {
    return async (url) => {

        try{
            let order = new Order(url, browser);
            await order.initialize();
            await scrap(order);
        }catch(err){
            console.log("Error At : ",url," Error : ",err)
        }
        
    };
}

let batch = [];

const start = app()

export default start;

let Bcount = 0;
async function exeBatch(urls) {
    try {

        console.log("Batch ", Bcount+1," Strated");
        await Promise.all([
            start(urls[0]),
            start(urls[1]),
            start(urls[2]),
            start(urls[3]),
        ]);
        Bcount++;
    } catch (err) {
        console.log(err, "Batch : ",Bcount+1);
    }
}

let count = 0;


while (count < 1) {
    const file = await open('./sample2.csv');
    batch.length = 0;
    try {
        for await (const line of file.readLines()) {
            
            batch.push(line);

            if (batch.length >=4) {
                let s = Date.now()
                await exeBatch(batch);
                let e = Date.now() - s;
                
                console.log("Batch : ", Bcount, " Time Taken : ", e, "ms  Total Average : ", (e / 4))
                logs.batchLogs.push({ batchCount: Bcount,timeTaken: e })
                batch.length = 0;
            }

        }

    } finally {
        await file.close();
    }

    console.log("File Occurance : ",count+1," Completed");
    count++;
}

logs.saveLog("Async.csv")