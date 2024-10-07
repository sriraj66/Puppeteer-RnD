import requests
urls = ["http://www.uttrakhandtaxi.com","https://zoho.com"]
URL = "http://localhost:3004"
for i in urls:
    for _ in range(5):
        res = requests.post(URL+"/url",json={
            "url":i
        })
        print(f"{i} STATUS CODE : {res.status_code}")
        
res = requests.get(URL+"/save")

print(f"{res.text} CODE : {res.status_code}")