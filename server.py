import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import aiohttp
import urllib.parse
import asyncio
from dotenv import load_dotenv

load_dotenv()

ors_api_key = os.getenv("ORS_API_KEY")

app = Flask(__name__)

CORS(app, origins=["http://127.0.0.1:5000"])

@app.route('/routejson')
def routejson():
    start_address = request.args.get("startaddress")
    end_address = request.args.get("endaddress")
    route_mode = request.args.get("routemode")

    if (start_address == None or end_address == None):
        return jsonify({
            "error": "Mancano gli indirizzi di partenza o di arrivo."
        })

    if route_mode == None:
        route_mode = "driving-car"

    try:
        coords = asyncio.run(getCoordinates(start_address, end_address))
    except:
        return jsonify({
            "error": "Non è stato possibile ricavare le coordinate geografiche dagli indirizzi forniti"
        })

    openrouteservice_url = f"https://api.openrouteservice.org/v2/directions/{route_mode}/geojson"

    request_body = {
        "coordinates": [
            [coords["Start"]["Lon"], coords["Start"]["Lat"]],
            [coords["End"]["Lon"], coords["End"]["Lat"]]
        ]
    }

    headers = {
        "Authorization": ors_api_key,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(openrouteservice_url, json=request_body, headers=headers)
        response.raise_for_status()

        data = response.json()
        return data
    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": f"Errore nella richiesta: {str(error)}",
        })

@app.route("/photon")
def photon():
    q = request.args.get("q", "")
    lat = request.args.get("lat", "")
    lon = request.args.get("lon", "")
    limit = request.args.get("limit", "5")
    lang = request.args.get("lang", "en")

    header = {
        "User-Agent": "stageMatch/1.0"
    }
    url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(q)}&lat={lat}&lon={lon}&limit={limit}&lang={lang}"

    try:
        response = requests.get(url, headers=header)
        response.raise_for_status()

        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 502

async def getCoordinates(address_start, address_end):
    if not address_start or not address_end:
        raise ValueError("Inserire gli indirizzi di partenza e arrivo")

    url_start = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(address_start)}&format=json&limit=1"
    url_end = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(address_end)}&format=json&limit=1"

    coords_start = []
    coords_end = []

    async with aiohttp.ClientSession(headers={"User-Agent": "dfsdfsdsf/1.0 (odfioifds.osdkdfp@gmail.com)"}) as session:
        # --- Richiesta indirizzo di partenza ---
        try:
            async with session.get(url_start) as response:
                if not response.ok:
                    raise Exception(f"HTTP Error: {response.status}")

                data = await response.json()

                if len(data) > 0:
                    coords_start.append(data[0]["lat"])
                    coords_start.append(data[0]["lon"])
                else:
                    raise ValueError("Indirizzo di partenza non trovato")
        except Exception as error:
            raise RuntimeError(
                "Errore nella richiesta conversione indirizzo partenza"
            ) from error

        await asyncio.sleep(1)

        # --- Richiesta indirizzo di arrivo ---
        try:
            async with session.get(url_end) as response:
                if not response.ok:
                    raise Exception(f"HTTP Error: {response.status}")

                data = await response.json()

                if len(data) > 0:
                    coords_end.append(data[0]["lat"])
                    coords_end.append(data[0]["lon"])
                else:
                    raise ValueError("Indirizzo di arrivo non trovato")
        except Exception as error:
            raise RuntimeError(
                "Errore nella richiesta conversione indirizzo arrivo"
            ) from error

    coords = {
        "Start": {
            "Lat": coords_start[0],
            "Lon": coords_start[1]
        },
        "End": {
            "Lat": coords_end[0],
            "Lon": coords_end[1]
        }
    }

    return coords

if __name__ == '__main__':
    app.run('127.0.0.1', 5001, debug=True)