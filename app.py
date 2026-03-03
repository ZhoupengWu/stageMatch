import os
from flask import Flask, render_template, redirect
from middleware.sso_middleware import SSOMiddleware
from dotenv import load_dotenv

load_dotenv()

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)

sso_middleware = SSOMiddleware(
    jwt_secret=os.getenv("JWT_SECRET"),
    jwt_audience=os.getenv("APP_AUDIENCE"),
    portal_url=os.getenv("PORTAL_URL")
)

@app.route('/')
def mainPage():
    return "default..."

@app.route('/login')
def login():
    return redirect("http://127.0.0.1:3020")

@app.route('/logged/map')
@sso_middleware.sso_login_required
def map():
    return render_template("/html/index.html")

if __name__ == '__main__':
    app.run('127.0.0.1', 5000, debug=True)