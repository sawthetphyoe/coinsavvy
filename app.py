from crypt import methods
import os
from unittest import result

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import  usd, percent, looksymbol, format_price

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
#     market_cap = s["market_cap"]
#     market_change_24h = s["market_change_24h"]
#     market_rank = s["market_rank"]
#     circulation_supply = s["circulation_supply"]
#     ath = s["ath"]
#     price_change_1h = s["price_change_1h"]
#     price_change_24h = s["price_change_24h"]
#     price_change_7d = s["price_change_7d"]
#     image = s["image"]
#     db.execute("INSERT INTO coins (symbol, name, price, market_cap, market_change_24h, market_rank, circulation_supply, ath, price_change_1h, price_change_24h, price_change_7d, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", symbol, name, price, market_cap, market_change_24h, market_rank, circulation_supply, ath, price_change_1h, price_change_24h, price_change_7d, image)


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

index_coins = ["bitcoin", "ethereum", "binancecoin", "terra-luna", "cardano", "solana"]

@app.route("/")
def index():
    coins = looksymbol(index_coins)
    return render_template("index.html", coins=coins, footer=True)
    """Show portfolio of stocks"""

@app.route("/markets", methods=["POST", "GET"])
def market():
    if request.method == "GET":
        coins = db.execute("SELECT * FROM coins")
        return render_template("market.html", coins=coins, footer=True)


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        return render_template("login.html")

@app.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "GET":
        return render_template("register.html")

@app.route("/trade", methods=["POST", "GET"])
def trade():
    return render_template("trade.html", footer=True)

@app.route("/search")
def search():
    search_coins = []
    rows = db.execute("SELECT * FROM coins WHERE name LIKE ?", "%" + request.args.get("q") + "%")
    for row in rows:
        row = {
            "symbol" : row["symbol"]
        }
        search_coins.append(row)
    return jsonify(search_coins)

# pk_7c3455bc0bf6443e9a6a923ed8e0699b



# @app.route("/update", methods=["POST", "GET"])
# def update():
#     if request.method == "POST":
#         data = request.get_json()
#         if data["template"] == "index" or data["template"] == "market":
#             refresh(index_coins)
#             rows = db.execute("SELECT * FROM coins WHERE symbol IN (?)", index_coins)
#             # for row in rows:
#             #     row["price"] = format_price(row["price"])
#             return jsonify(rows)