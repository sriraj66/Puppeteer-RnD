import {saveBatchLogs,saveLogs, saveMLogs} from "../logs/csv.js";


class Timer {
   constructor() {
      this.batch = 0;
      this.Torder = 0;
      this.Forder = 0; // Finished Order
      this.Ttime = 0;
   }
}

class Logs{

   constructor(){
      this.logs = [];
      this.MLogs = [];
      this.s = Date.now();
      this.batchLogs = [];
   }
   
   addMLog(url,data){
      
      data.url = url
      this.MLogs.push(data)
   }

   addLog(data){
      this.logs.push(data)
   }

   saveLog(file){
      console.log("Writing into CSV")
      let TimeofExecution = Date.now() - this.s;
      console.log("Before Writing CSV Time Of Execution : ",TimeofExecution +"ms")

      if(this.batchLogs.length!=0){
         saveBatchLogs(this.batchLogs,file)
      }
      if(this.logs.length!=0){
         saveLogs(this.logs,file);
         saveMLogs(this.MLogs,file)
         
      }
      TimeofExecution = Date.now() - this.s;
      console.log("Time Of Execution : ",TimeofExecution +"ms")
      this.logs.length=0;
      // process.exit()
   }
   

}
const TimeOut = 60000;
const timer = new Timer();
const logs = new Logs();
export {timer,logs,TimeOut};