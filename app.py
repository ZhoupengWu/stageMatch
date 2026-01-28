import os
from flask import Flask, jsonify, render_template
from dotenv import load_dotenv

load_dotenv()

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)

@app.route('/')
def helloWorld():
    return render_template("html/index.html")

@app.route("/api/config")
def getEnv():
    return jsonify(
        {
            "apiKey": os.getenv("ORS_API_KEY_PATH")
        }
    )

if __name__ == '__main__':
    app.run('127.0.0.1', 5000, debug=True)