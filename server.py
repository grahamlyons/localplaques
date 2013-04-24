from flask import Flask, render_template, make_response
from urllib2 import urlopen

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/plaques/<lat>/<lng>")
def plaques(lat, lng):
    url = get_url(float(lat), float(lng))
    plaque_response = urlopen(url)
    response = make_response(plaque_response.read())
    response.headers['Content-Type'] = 'application/json'
    return response

def get_boundary(lat, lng):
    delta = 0.025
    return {
        "topleft_lat":lat + delta,
        "topleft_lng":lng - delta,
        "bottomright_lat":lat - delta,
        "bottomright_lng":lng + delta
    }

def get_url(lat, lng):
    boundary = get_boundary(lat, lng)
    base_url = "http://openplaques.org"
    path = "/plaques.json"
    query = "?limit=50&box=[{topleft_lat},{topleft_lng}],[{bottomright_lat},{bottomright_lng}]".format(**boundary)
    url = "{0}{1}{2}".format(base_url, path, query)
    return url

if __name__ == "__main__":
    app.run("0.0.0.0", debug=True)
