from flask import Flask, render_template, make_response
from httplib2 import Http

class Cache(dict):

    def set(self, key, value):
        self.__setitem__(key, value)

    def delete(self, key):
        self.__delitem__(key)

    def __nonzero__(self):
        return True


app = Flask(__name__)

cache = Cache()

client = Http(cache)

@app.route("/")
def index():
    response =  make_response(render_template("index.html"))
    response.headers['Cache-Control'] = 'max-age=300'
    return response

@app.route("/plaques/<lat>/<lng>")
def plaques(lat, lng):
    url = get_url(float(lat), float(lng))
    plaque_response, plaque_data = client.request(url)
    response = make_response(plaque_data)
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
