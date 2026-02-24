from flask import Flask, render_template, redirect

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)

@app.route('/')
def mainPage():
    return "default..."

@app.route('/login')
def login():
    return redirect("http://127.0.0.1:3020")

@app.route('/logged/map')
def map():
    return render_template("/html/index.html")

if __name__ == '__main__':
    app.run('127.0.0.1', 5000, debug=True)