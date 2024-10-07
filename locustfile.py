from locust import HttpUser, task, between
import time
from lib.getUrl import getUrl 
from lib.logger import addLog
import json


class ExpressAppUser(HttpUser):
    # wait_time = between(1, 5) 
    host = "http://localhost:3000"
    
    @task
    def post_url(self):
        url = getUrl()
        CHECKS = 8
        if(url!=None):
            
        
            
            for i in range(CHECKS):
                    
                response = self.client.post("/url", json={"url": url})
                
                if(response.status_code == 200):
                    print("Response content:", response.text)
                    addLog(response.text,response.elapsed.total_seconds())   
                    break
                if(response.status_code==500):
                    print("ERROR :", response.text)
                    
                print("Retrying ",i+1," : ",url)
                time.sleep(5)
            else:
                print("URL FAILED : ",url)    
        else:
            print(f"User stop's No Urls in hub.")
            self.stop()
            