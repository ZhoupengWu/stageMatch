import os
from flask import Flask, request, jsonify
import requests
import aiohttp
import urllib.parse
import asyncio
from dotenv import load_dotenv

load_dotenv()

ors_api_key = os.getenv("ORS_API_KEY")

app = Flask(__name__,
    static_folder="./resources",
    template_folder="./resources"
)

@app.route('/routejson')
def routejson():
    startaddress = request.args.get("startaddress")
    endaddress = request.args.get("endaddress")
    routemode = request.args.get("routemode")

    if (startaddress==None or endaddress==None):
        return {
            "error": "Mancano gli indirizzi di partenza o di arrivo."
        }
    if routemode==None:
        routemode="driving-car"  # default mode

    # pos to coords
    coords = None
    try:
        coords = asyncio.run(get_coordinates(startaddress, endaddress))
    except:
        return jsonify({
            "error": "Non è stato possibile ricavare le coordinate geografiche dagli indirizzi forniti"
        })

    print (f"lat:{coords["Start"]["Lat"]}")
    openrouteservice_url = "https://api.openrouteservice.org/v2/directions/" + routemode + "/geojson"
    request_body = {
    "coordinates": [
        [coords["Start"]["Lon"], coords["Start"]["Lat"]],  # Point A
        [coords["End"]["Lon"], coords["End"]["Lat"]]       # Point B
    ]
    }

    headers = {
        "Authorization": ors_api_key,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(openrouteservice_url, json=request_body, headers=headers)
        response.raise_for_status()  # raises exception for 4xx/5xx

        data = response.json()
        return data

    except requests.exceptions.RequestException as error:
        print("Errore nella ricerca del percorso:", error)
        return jsonify({
            "error": "Errore nella richiesta: " + str(error),
        })

async def get_coordinates(address_start, address_end):

    if not address_start or not address_end:
        raise ValueError("Inserire gli indirizzi di partenza e arrivo")

    url_start = (
        "https://nominatim.openstreetmap.org/search?"
        f"q={urllib.parse.quote(address_start)}&format=json&limit=1"
    )
    url_end = (
        "https://nominatim.openstreetmap.org/search?"
        f"q={urllib.parse.quote(address_end)}&format=json&limit=1"
    )
    print(f"INDIRIZZO PARTENZA: {url_start}")
    print(f"INDIRIZZO DESTINAZIONE: {url_end}")
    coords_start = []
    coords_end = []

    async with aiohttp.ClientSession(
        headers={"User-Agent": "dfsdfsdsf/1.0 (odfioifds.osdkdfp@gmail.com)"}
    ) as session:

        # --- Richiesta indirizzo di partenza ---
        try:
            async with session.get(url_start) as response:
                if (response.status != 200):
                    raise Exception("HTTP Error: " + f"{response.status}")
                data = await response.json()
                print("partenza: ")
                print(data)
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
                if (response.status != 200):
                    raise Exception("HTTP Error: " + f"{response.status}")
                data = await response.json()
                print("arrivo: ")
                print(data)
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
