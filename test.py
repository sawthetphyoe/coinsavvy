import requests
import pandas as pd
from cs50 import SQL

db = SQL("sqlite:///finance.db")

def lookup():
    api_key = "pk_7c3455bc0bf6443e9a6a923ed8e0699b"
    api_url = f'https://cloud.iexapis.com/stable/ref-data/crypto/symbols?token={api_key}'
    raw = requests.get(api_url).json()
    return raw

symbols = lookup()
for symbol in symbols:
    db.execute("INSERT INTO symbols (symbol, name) VALUES (?, ?)", symbol["symbol"], symbol["name"])


# print("Price of 1 Bitcoin: {} USD.".format(btc))