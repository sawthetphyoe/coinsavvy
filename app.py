from email import message
import os
from turtle import circle

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

# Trend coins for home page 
home_coins = ["bitcoin", "ethereum", "binancecoin", "tether", "terra-luna", "cardano", "solona", "shiba-inu"]

# Trend coins for trade page 
trade_coins = ["bitcoin", "ethereum", "binancecoin", "terra-luna", "cardano"]




# ALl coins 
all_coins = []
rows = db.execute("SELECT coin_id FROM cryptos")
for row in rows:
    all_coins.append(row["coin_id"])


# Home page route 
@app.route("/")
def index():
    coins = look(home_coins)
    if session:
        user_id = session["user_id"]
        user = db.execute("SELECT * FROM users WHERE id = ?", user_id)
        user_name = user[0]["username"]
        return render_template("index.html", coins=coins, footer=True, user_name=user_name)
    else:
        return render_template("index.html", coins=coins, footer=True)

# Market page route 
@app.route("/markets", methods=["POST", "GET"])
def markets():
    if request.method == "GET":
        coins = look(all_coins)
        if session:
            user_id = session["user_id"]
            user = db.execute("SELECT * FROM users WHERE id = ?", user_id)
            user_name = user[0]["username"]
            return render_template("markets.html", coins=coins, footer=True, user_name=user_name)
        else:
            return render_template("markets.html", coins=coins, footer=True)


# Log in page route 
@app.route("/login", methods=["POST", "GET"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return render_template("apology.html", message="must provide username")

        # Ensure password was submitted
        elif not request.form.get("password"):
            return render_template("apology.html", message="must provide password")

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return render_template("apology.html", message="invalid username and/or password")

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


# Log out route
@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


# Register page route 
@app.route("/register", methods=["POST", "GET"])
def register():
    session.clear()
    if request.method == "POST":

        user = request.form.get("username")
        password = request.form.get("password")
        confirm = request.form.get("confirm")
        # Ensure username was submmited
        if not user:
            return render_template("apology.html", message="Choose a username!")

        # Ensure password was submmited
        if not password:
            return render_template("apology.html", message="Create a password!")

        # Ensure password confirmation was submmited
        if not confirm:
            return render_template("apology.html", message="Confirm your password!")

        if not password == confirm:
            return render_template("apology.html", message="Passwords do not match")

        # Ensure username is not already exist in database
        user_exist = db.execute("SELECT * FROM users WHERE username = ?", user)
        if user_exist:
            return render_template("apology.html", message="This username is already taken by someone else!")

        # Insert new user into database
        db.execute("INSERT INTO users (username, hash) VALUES(?, ?)", user, generate_password_hash(password))

        # Get new user from database
        new_user = db.execute("SELECT * FROM users WHERE username = ?", user)

        # Remember which user has logged in
        session["user_id"] = new_user[0]["id"]

        return redirect("/")
    else:
        return render_template("register.html")


# Trade pages route 
@app.route("/trade/<coin_id>", methods=["POST", "GET"])
def trade(coin_id):
    coins = look(trade_coins)
    main_coin = look([coin_id])[0]
    main_coin["chart_exchange"] = db.execute("SELECT chart_exchange FROM cryptos WHERE coin_id = ?", coin_id)[0]["chart_exchange"]
    if session:
        user_id = session["user_id"]
        user = db.execute("SELECT * FROM users WHERE id = ?", user_id)
        cash = user[0]["cash"]
        coin_balance = db.execute("SELECT amount FROM balances WHERE user_id = ? and coin_id = ?", user_id, coin_id)
        return render_template("trade.html", main_coin=main_coin, coins=coins, footer=True, cash=cash, coin_balance=coin_balance)
    else:
        return render_template("trade.html", main_coin=main_coin, coins=coins, footer=True)


# Update route 
@app.route("/update", methods=["POST", "GET"])
def update():
    if request.method == "POST":
        data = request.get_json()
        if data["template"] == "index":
            rows = look(home_coins)
        elif data["template"] == "market":
            rows = look(all_coins)
        elif data["template"] == "trade":
            rows = look([data["mainCoin"]])
        return jsonify(rows)

# Apology route 
@app.route("/apology")
def apology():
    message = "Username is not valid"
    return render_template("apology.html", message=message)


# Wallet page route 
@app.route("/wallet", methods=["POST", "GET"])
def wallet():
    if session:
        user_id = session["user_id"]
        user = db.execute("SELECT * FROM users WHERE id = ?", user_id)
        user_name = user[0]["username"]
        return render_template("wallet.html", footer=False, user_name=user_name)

