from flask import Flask, render_template, make_response, abort
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

@app.route("/plaques/<nw_lat>/<nw_lng>/<se_lat>/<se_lng>")
def plaques(**kwargs):
    try:
        coords = dict(((i[0], float(i[1])) for i in kwargs.items()))
    except ValueError:
        abort(400)
    url = get_url(**coords)
    plaque_response, plaque_data = client.request(url)
    response = make_response(plaque_data)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.route("/about")
def about():
    response = make_response(render_template("about.html"))
    response.headers['Cache-control'] = 'max-age=3600'
    return response

def get_url(**kwargs):
    base_url = "http://openplaques.org"
    path = "/plaques.json"
    query = "?limit=1000&box=[{nw_lat},{nw_lng}],[{se_lat},{se_lng}]".format(**kwargs)
    url = "{0}{1}{2}".format(base_url, path, query)
    return url


if __name__ == "__main__":
    app.run("0.0.0.0", debug=True)
