import { writeFileSync } from 'fs';

export function saveLogs(data, fileName = 'output.csv') {
    fileName = "csv/"+fileName
    let csvContent = "S.N,Batch Count,Total Order,URL,Title,Length,Time Taken(ms),Render Time (ms)\n";
    
    data.forEach((item, index) => {
        let sn = index + 1;
        
        csvContent += `${sn},${item.batchCount},${item.totalOrder},${item.url},${item.title.length==0?"Error or No Title":item.title.replace(/,/g, '')},${item.len},${item.timeTaken},${item.renderTime}\n`;
    });

    writeFileSync(fileName, csvContent);
    console.log(`Values saved to ${fileName}`);
}


export function saveMLogs(data, fileName = 'output.csv') {
    fileName = "csv/"+"metrics_"+fileName
    let csvContent = "S.N,URL,Timestamp,Documents,Frames,JSEventListeners,Nodes,LayoutCount,RecalcStyleCount,LayoutDuration,RecalcStyleDuration,ScriptDuration,TaskDuration,JSHeapUsedSize,JSHeapTotalSize,RenderingTime\n";
    
    data.forEach((item, index) => {
        let sn = index + 1;
        
        csvContent += `${sn},${item.url},${item.Timestamp},${item.Documents},${item.Frames},${item.JSEventListeners},${item.Nodes},${item.LayoutCount},${item.RecalcStyleCount},${item.LayoutDuration},${item.RecalcStyleDuration},${item.ScriptDuration},${item.TaskDuration},${item.JSHeapUsedSize},${item.JSHeapTotalSize},${item.renderTime}\n`;
    });

    writeFileSync(fileName, csvContent);
    console.log(`Values saved to ${fileName}`);
}

export function saveBatchLogs(data, fileName = 'output.csv') {
    
    fileName = "csv/"+"Batch_"+fileName
    let csvContent = "S.N,Batch No,Time Taken\n";
    

    data.forEach((item, index) => {
        let sn = index + 1;
        csvContent += `${sn},${item.batchCount},${item.timeTaken}\n`;
    });

    writeFileSync(fileName, csvContent);
    console.log(`Values saved to ${fileName}`);
}
