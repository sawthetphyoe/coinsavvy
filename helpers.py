import os
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps

from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json

symbols = ["BTC", "ETH", "BNB", "XRP", "ADA", "MATIC", "LTC"]

def usd(value):
    """Format value as USD."""
    return f"${value:,.2f}"

def format_price(value):
    """Format value as USD."""
    return f"{value:.8f}"

def usd_six(value):
    """Format value as USD."""
    return f"${value:,.6f}"

def percent(value):
    """Format value as USD."""
    return f"{value:.2f}%"

def lookup():
    url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest'
    parameters = {
        'convert':'USD',
        'symbol' :'BTC,ETH,BNB,XRP,ADA,MATIC,LTC'
        }
    headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': 'd2dbe193-f042-426e-866f-90263c1bc57b',
    }

    session = Session()
    session.headers.update(headers)

    try:
        result = []
        response = session.get(url, params=parameters)
        data = json.loads(response.text)
        for symbol in symbols:
            coin = data["data"][symbol][0]
            text = {
                "symbol": coin["symbol"],
                "name": coin["name"],
                "price": float(coin["quote"]["USD"]["price"]),
                "market_cap" : "{:,.0f}".format(round(float(coin["quote"]["USD"]["market_cap"]/1000000))),
                "price_change_24h": "{:.2f}".format(round(float(coin["quote"]["USD"]["percent_change_24h"]), 2))

            }
            result.append(text)
        return result
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        return e

def look():
    """Look up quote for symbol."""

    # Contact API
    try:
        url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin%2Cethereum%2Cbinancecoin%2Cripple%2Ccardano%2Cmatic-network%2Clitecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h"
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
                "name": coin["name"],
                "symbol": coin["symbol"].upper(),
                "price": float(coin["current_price"]),
                "change": "{:.2f}".format(round(float(coin["price_change_percentage_24h"]), 2)),
                "market" : "{:,.0f}".format(round(float(coin["market_cap"]/1000000)))
            }
            result.append(text)
        return result
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        return e
    # except (KeyError, TypeError, ValueError):
    #     return None


def lookall():
    """Look up quote for symbol."""

    # Contact API
    try:
        url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"
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
                "symbol": coin["symbol"].upper(),
                "name": coin["name"],
                "price": float(coin["current_price"]),
                "market_cap" : "{:,.0f}".format(round(float(coin["market_cap"]/1000000))),
                "market_change_24h" : "{:.2f}".format(round(float(coin["market_cap_change_percentage_24h"]), 2)),
                "market_rank" : coin["market_cap_rank"],
                "circulation_supply" : "{:,.0f}".format(round(float(coin["circulating_supply"]/1000000))),
                "ath" : float(coin["ath"]),
                "price_change_1h": "{:.2f}".format(round(float(coin["price_change_percentage_1h_in_currency"]), 2)),
                "price_change_24h": "{:.2f}".format(round(float(coin["price_change_percentage_24h_in_currency"]), 2)),
                "price_change_7d": "{:.2f}".format(round(float(coin["price_change_percentage_7d_in_currency"]), 2)),
                "image" : coin["image"]
            }
            result.append(text)
        return result
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        return e


index_coins = ["bitcoin", "ethereum", "binancecoin", "usd-coin", "tether", "ripple", "litecoin"]


def looksymbol(coins):
    """Look up quote for symbol."""

    # Contact API
    try:
        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={'%2C'.join(coins)}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"
        # url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"
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
                "symbol": coin["symbol"].upper(),
                "name": coin["name"],
                "price": float(coin["current_price"]),
                "market_cap" : "{:,.0f}".format(round(float(coin["market_cap"]/1000000))),
                "market_change_24h" : "{:.2f}".format(round(float(coin["market_cap_change_percentage_24h"]), 2)),
                "market_rank" : coin["market_cap_rank"],
                "circulation_supply" : "{:,.0f}".format(round(float(coin["circulating_supply"]/1000000))),
                "ath" : float(coin["ath"]),
                "price_change_1h": "{:.2f}".format(round(float(coin["price_change_percentage_1h_in_currency"]), 2)),
                "price_change_24h": "{:.2f}".format(round(float(coin["price_change_percentage_24h_in_currency"]), 2)),
                "price_change_7d": "{:.2f}".format(round(float(coin["price_change_percentage_7d_in_currency"]), 2)),
                "image" : coin["image"]
            }
            result.append(text)
        return result
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        return e

# print(looksymbol())