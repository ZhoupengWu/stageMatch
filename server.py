from flask import Flask, render_template
import requests
app = Flask(__name__)

@app.route('/')
def index():
    return getpage("index")

@app.route('/routejson')
def route_json(startLon, startLat, endLon, endLat): 
    api_key = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYzNjJmMmZlNDJkZTRmM2Y5NzYwODI3YWZjMDFhNmMzIiwiaCI6Im11cm11cjY0In0="
    openrouteservice_url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    request_body = {
    "coordinates": [
        [startLon, startLat],  # Point A
        [endLon, endLat]       # Point B
    ]
    }

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=request_body, headers=headers)
        response.raise_for_status()  # raises exception for 4xx/5xx

        data = response.json()
        return data

except requests.exceptions.RequestException as error:
    print("Errore nella ricerca del percorso:", error)

def getpage(pagename):
    return render_template(pagename + ".html")
if __name__ == '__main__':
    app.run('192.168.103.44', 5000, debug=True)