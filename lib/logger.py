import json
import csv

logs = []

path = "/home/sriram-pt7678/Desktop/events/lib/logs.json"
path_csv = "/home/sriram-pt7678/Desktop/events/lib/logs.csv"
path_logs = "/home/sriram-pt7678/Desktop/events/lib/logs/"

def addLog(log,sec):
    try:

        data = json.loads(log)

        logs.append({
            "id":data['id'],
            "url":data['url'],
            "title":data["title"],
            "RTime":data['renderTime'],
            "PTime(sec)" : int(data['timeTaken'])/1000,
            "TTime(sec)":sec,
        }) 

    except Exception as e:
        print("Error While Adding Logs : ",e)


def getLen():
    return len(logs)

def saveLog():
    try:
        if(len(logs)!=0):
            print("Saving to Responses .json")
            with open(path,'+w') as f:
                json.dump(logs,f,indent=4)
                f.close()
            print("Done")
            
            print("Saving to Responses .csv")
            with open(path_csv,'+w',newline='') as f:
                csv_writer = csv.writer(f)
                
                count = 0
                for data in logs:
                    if count == 0:
                        header = data.keys()
                        csv_writer.writerow(header)
                        count += 1
                    csv_writer.writerow(data.values())

                f.close()

            logs.clear()
            print("Done")
            
            
    except Exception as e:
        print("Error While Saving : ",e)



def writeLog(urls,SPLIT):
    try:
        with open(f"{path_logs}/urls_{SPLIT}.txt","+w") as f:
            for i in urls:
                f.write(i+"\n")
            f.close()
        
    except Exception as e:
        print("Writing Logs "+e)
        