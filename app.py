from crypt import methods
import os
from unittest import result

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import  usd, percent, lookall, format_price

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Custom filter
app.jinja_env.filters["usd"] = usd
app.jinja_env.filters["percent"] = percent

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

# Make sure API key is set
# if not os.environ.get("API_KEY"):
#     raise RuntimeError("API_KEY not set")

# init_values = lookall()
# for s in init_values:
#     symbol = s["symbol"]
#     name = s["name"]
#     price = s["price"]
#     market = s["market"]
#     change = s["change"]
#     image = s["image"]
#     db.execute("INSERT INTO cryptos (symbol, name, price, market, change, image) VALUES (?, ?, ?, ?, ?, ?)", symbol, name, price, market, change, image)


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

coin_symbols = ["BTC", "ETH", "BNB", "XRP", "ADA", "MATIC", "LTC"]

def refresh():
    init_values = lookall()
    for s in init_values:
        symbol = s["symbol"]
        price = s["price"]
        market = s["market"]
        change = s["change"]
        db.execute("UPDATE cryptos SET price = ?, market = ?, change = ? WHERE symbol = ?", price,market,change,symbol)

refresh()

@app.route("/")
def index():
    coins = db.execute("SELECT * FROM cryptos WHERE symbol IN ('BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'MATIC', 'LTC')")
    return render_template("index.html", coins=coins, footer=True)
    """Show portfolio of stocks"""

@app.route("/update", methods=["POST", "GET"])
def update():
    if request.method == "GET":
        refresh()
        rows = db.execute("SELECT * FROM cryptos")
        # for row in rows:
        #     row["price"] = format_price(row["price"])
    return jsonify(rows)

@app.route("/markets", methods=["POST", "GET"])
def market():
    if request.method == "GET":
        coins = db.execute("SELECT * FROM cryptos")
        return render_template("market.html", coins=coins, footer=True)


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        return render_template("login.html")

@app.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "GET":
        return render_template("register.html")

@app.route("/search")
def search():
    search_coins = []
    rows = db.execute("SELECT * FROM cryptos WHERE name LIKE ?", "%" + request.args.get("q") + "%")
    for row in rows:
        row = {
            "symbol" : row["symbol"]
        }
        search_coins.append(row)
    return jsonify(search_coins)

# pk_7c3455bc0bf6443e9a6a923ed8e0699b