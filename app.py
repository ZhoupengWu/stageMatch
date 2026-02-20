import os
from flask import Flask, jsonify, render_template, redirect

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)

@app.route('/')
def defaultRoute():
    # una pagina che permette di andare su /portal
    return "default..."
@app.route('/portal')
def redirectToPortal():
    return redirect("http://127.0.0.1:3020")

if __name__ == '__main__':
    app.run('127.0.0.1', 5000, debug=True)