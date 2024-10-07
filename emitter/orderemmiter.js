import { EventEmitter } from "events";
import { logs, TimeOut, timer } from "../model/configs.js";

export default class Emitter extends EventEmitter {
    constructor() {
        super();

        this.on("getOrder", async (order) => {
            try {
                order.log("END OF LOG");
                order.logEnd();
                await order.getContext().close();
                order.log("ENDED!!");

            } catch (error) {
                order.log("ERROR : getOrder : " + error.message);
                if(order.reject!=null){
                    order.reject(error)
                }

            } finally {
                let avgtime = order.calcTime();
                order.logTime(`Avg.Time : ${Math.round(avgtime)}ms belongs to : ${timer.Forder} orders OUTOF ${timer.Torder} orders`)
                order.logTime(`TOTAL TIME : ${Math.round(timer.Ttime)}ms T.Batch : ${Math.floor((timer.Forder / 4))}`)

                if (order.write) {
                    logs.addLog({ batchCount: Math.floor((timer.Forder / 4)), totalOrder: timer.Forder, url: order.getUrl(), title: order.title, len: order.length, timeTaken: Math.round(order.getTime()) })

                }

                // if(order.resolve != null){
                //     order.resolve();
                // }
                if(order.res !=null){
                    order.res.send({
                        id: order.id,
                        url: data.url,
                        timeTaken: order.time,
                        title: order.title,
                        code: order.code,
                        length: order.length,
                    });
                }

                

                // if (timer.Forder == timer.Torder) {
                //     logs.saveLog("Emmit.csv");
                //     console.log("Log Saved")
                // }

            }

        });

        this.on("scrap", async (order) => {

            try {
                // await order.initialize();
                let url = order.getUrl();
                let page =  await order.getPage();
                order.log("GOTO Started");
                let res = await page.goto(url, { waitUntil: 'networkidle2', timeout: TimeOut });
                order.setCode(res.status());

                if (res.status() == 200) {
                    order.setTitle(await page.title());
                    order.write = true;

                    order.log("Title Extracted");
                    order.log("GOTO Finished");
                    this.emit("dscrap", order);
                } else {
                    this.emit("getOrder", order);
                }

            } catch (error) {
                order.log("ERROR : Scrap : " + error.message);
                this.emit("getOrder", order);
            }


        });

        this.on("dscrap", async(order) => {
            try {
                order.log("Extraction Started");
                let page = await order.getPage();
                let content = await page.content();
                order.setLength(content.length);
                order.log("Extraction Done!!");
                this.emit("getOrder", order);

            } catch (error) {
                order.log("ERROR : DScrap : " + error.message);
                this.emit("getOrder", order);

            }

        });
    }
}
