import os
from threading import get_ident
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps

from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json

def decimal_four(value):
    if value == None: return "--"
    value = float(value)
    return f"{value:.4f}"

def usd(value, digit=2):
    if value == None: return "--"
    value = float(value)
    if (value > 1 and value < 2) or value < 1:
        digit = 4
    if value < 0.0001:
        digit = 6
    return f"${value:,.{digit}f}"

def million(value):
    if value == None: return "--"
    value = float(value)
    if value > 1000000000000:
        return f"${round(value/1000000000):,.0f}B"
    return f"${round(value/1000000):,.0f}M"

def percent(value):
    if value == None: return "--"
    return f"{float(value):+.2f}%"

# def login_required(f):
#     """
#     Decorate routes to require login.

#     https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
#     """
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         if session.get("user_id") is None:
#             return redirect("/login")
#         return f(*args, **kwargs)
#     return decorated_function

def look(coins):
    # Contact API
    try:
        if coins == None:
            url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"
        else:
            url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={'%2C'.join(coins)}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException:
        return None

    # Parse response
    try:
        data = response.json()
        result = []
        for coin in data:
            text = {
                "coin_id" : coin["id"],
                "symbol": coin["symbol"].upper(),
                "name": coin["name"],
                "image" : coin["image"],
                "price": usd(coin["current_price"]),
                "ath" : usd(coin["ath"]),
                "price_change_1h": percent(coin["price_change_percentage_1h_in_currency"]),
                "price_change_24h": percent(coin["price_change_percentage_24h_in_currency"]),
                "price_change_7d": percent(coin["price_change_percentage_7d_in_currency"]),
                "market_cap" : million(coin["market_cap"]),
                "market_change_24h" : percent(coin["market_cap_change_percentage_24h"]),
                "market_rank" : coin["market_cap_rank"],
                "circulation_supply" : million(coin["circulating_supply"]),
            }
            result.append(text)
        return result
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        return e
