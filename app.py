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

trend_coins = ["bitcoin", "ethereum", "binancecoin", "terra-luna", "cardano", "solana"]

@app.route("/")
def index():
    coins = look(trend_coins)
    return render_template("index.html", coins=coins, footer=True)

@app.route("/markets", methods=["POST", "GET"])
def market():
    if request.method == "GET":
        coins = look(None)
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

# pk_7c3455bc0bf6443e9a6a923ed8e0699b



@app.route("/update", methods=["POST", "GET"])
def update():
    if request.method == "POST":
        data = request.get_json()
        if data["template"] == "index":
            rows = look(trend_coins)
        elif data["template"] == "market":
            rows = look(None)
        return jsonify(rows)