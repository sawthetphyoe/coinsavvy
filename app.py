from cgitb import lookup
from crypt import methods
import os
from unittest import result

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import  usd, look

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Trend coins 
trend_coins = ["bitcoin", "ethereum", "binancecoin", "terra-luna", "cardano"]

# ALl coins 
all_coins = []
rows = db.execute("SELECT coin_id FROM cryptos")
for row in rows:
    all_coins.append(row["coin_id"])


# Home page route 
@app.route("/")
def index():
    coins = look(trend_coins)
    return render_template("index.html", coins=coins, footer=True)


# Market page route 
@app.route("/markets", methods=["POST", "GET"])
def market():
    if request.method == "GET":
        coins = look(all_coins)
        return render_template("market.html", coins=coins, footer=True)


# Log in page route 
@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "GET":
        return render_template("login.html")


# Register page route 
@app.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "GET":
        return render_template("register.html")


# Trade pages route 
@app.route("/trade/<coin_id>", methods=["POST", "GET"])
def trade(coin_id):
    coins = look(trend_coins)
    main_coin = look([coin_id])[0]
    main_coin["chart_exchange"] = db.execute("SELECT chart_exchange FROM cryptos WHERE coin_id = ?", coin_id)[0]["chart_exchange"]
    return render_template("trade.html", main_coin=main_coin, coins=coins, footer=True)

# Update route 
@app.route("/update", methods=["POST", "GET"])
def update():
    if request.method == "POST":
        data = request.get_json()
        if data["template"] == "index":
            rows = look(trend_coins)
        elif data["template"] == "market":
            rows = look(all_coins)
        elif data["template"] == "trade":
            rows = look([data["mainCoin"]])
        return jsonify(rows)