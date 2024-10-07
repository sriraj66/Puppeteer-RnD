import csv
from .logger import saveLog,getLen,writeLog

SPLIT = int(1000)

with open("./lib/sample.csv",newline='') as f:
    reader = csv.reader(f)
    urls = [i[0] for i in reader]
    urls = urls[:SPLIT]
    writeLog(urls,SPLIT)
    
    print("Total Urls : ",len(urls))
    f.close()

 
def getUrl():
    try:
        return urls.pop(0)
    except:
        if getLen() >=SPLIT:
            saveLog()
            # quit()
        return None
