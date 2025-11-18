from flask import Flask, render_template

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)

@app.route('/')
def helloWorld ():
    return render_template("html/index.html")

if __name__ == '__main__':
    app.run('127.0.0.1', 5000, debug=True)