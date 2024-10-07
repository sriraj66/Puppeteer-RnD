import { logs, TimeOut, timer } from "../model/configs.js";

async function getOrder(order) {

    try {
        order.log("END OF LOG")
        order.logEnd()
        await order.CalcMetrics();

        await order.getContext().close()
        order.log("ENDED!!")
    } catch (error) {
        order.log("ERROR : getOrder : " + error.message);

    } finally {
        let avgtime = order.calcTime();
        order.logTime(`Avg.Time : ${Math.round(avgtime)}ms belongs to : ${timer.Forder} orders OUTOF ${timer.Torder} orders`)
        order.logTime(`TOTAL TIME : ${Math.round(timer.Ttime)}ms T.Batch : ${Math.floor((timer.Forder / 4))}`)
        if (order.write) {
            logs.addLog({ batchCount: Math.floor((timer.Forder / 4)), totalOrder: timer.Forder, url: order.getUrl(), title: order.title, len: order.length, timeTaken: Math.round(order.getTime()),renderTime : order.renderTime})
            logs.addMLog(order.getUrl(),order.metrics)
        }
    }

}

async function dscrap(order) {
    try {
        order.log("Extraction Strated")
        let page = await order.getPage();
        let content = await page.content()
        order.log("Extraction HTML5")

        let res = await order.extractHTML5Content();
        order.setLength(res.length)

        order.log(`HTML5 Extraction Completed Length : ${res.length}\nTaking Screenshot`)
        await order.takeScreenshot()
        order.log("Screenshot Completed")
        // order.setLength(content.length)
        order.log("Extraction Done!!")
        await getOrder(order)

    } catch (error) {
        order.log("ERROR : Scrap : " + error.message);
        await getOrder(order)

    }

}

export default async function scrap(order) {

    try {
        let url = order.getUrl();
        let page = await order.getPage();

        // await page.setJavaScriptEnabled(false); //new 


        order.log("GOTO Strated")

        let start = Date.now()
        let res = await page.goto(url, { waitUntil: 'networkidle2', timeout: TimeOut })
        order.renderTime = Date.now() - start
        order.setCode(res.status())
        // await page.setJavaScriptEnabled(true); //new 

        if (res.status() == 200) {
            order.log(`Rendering time: ${order.renderTime} ms for URL : ${url}`);
            order.setTitle(await page.title())
            order.write = true;
            order.log("GOTO Finished")
            await dscrap(order);
        } else {
            await getOrder(order)

        }

    } catch (error) {
        order.log("ERROR : Scrap : " + error.message);
        await getOrder(order)
    }


}




