"use strict";

////////// Variables to change later //////////
const autoRefresh = false;
const autoUpdateInterval = 6000;

////////// Sticky Nav //////////
const observeEl = document.querySelector(".section-showcase");

const obs = new IntersectionObserver(
	function (entries) {
		const ent = entries[0];
		if (!ent.isIntersecting) document.body.classList.add("sticky");
		if (ent.isIntersecting) document.body.classList.remove("sticky");
	},
	{
		root: null,
		threshold: 0,
		rootMargin: "-90px",
	}
);
if (observeEl) obs.observe(observeEl);

////////// Color Change for Value Updates ///////////
const colorChange = () => {
	const colorEls = document.querySelectorAll(".color");
	colorEls.forEach(function (el) {
		if (parseFloat(el.innerHTML) > 0) {
			el.style.color = "#16a34a";
		} else {
			el.style.color = "#dc2626";
		}
	});
};
colorChange();

////////// Ajax Function for auto refresh prices and market informations //////////
const update = function () {
	const data = document.querySelector("main").dataset;
	$.ajax({
		type: "POST",
		url: "/update",
		data: JSON.stringify(data),
		contentType: "application/json",
		dataType: "json",
		success: function (result) {
			if (data.template == "index" || data.template == "market") {
				length = Object.keys(result).length;
				for (let i = 0; i < length; i++) {
					coin = result[i];
					row = document.querySelector(`.${coin.symbol}`);
					if (row) {
						row.querySelector(".coin-price").innerHTML = coin.price;
						row.querySelector(".coin-market-cap").innerHTML = coin.market_cap;
						row.querySelector(".coin-price-change-24h").innerHTML =
							coin.price_change_24h;
					}
				}
			} else if (data.template == "trade") {
				coin = result[0];
				document.querySelector(".coin-ath").innerHTML = coin.ath;
				document.querySelector(".coin-price-change-1h").innerHTML =
					coin.price_change_1h;
				document.querySelector(".coin-price-change-24h").innerHTML =
					coin.price_change_24h;
				document.querySelector(".coin-price-change-7d").innerHTML =
					coin.price_change_7d;
				document.querySelector(
					".coin-market-rank"
				).innerHTML = `#${coin.market_rank}`;
				document.querySelector(".coin-market-change-24h").innerHTML =
					coin.market_change_24h;
				document.querySelector(".coin-market-cap-trade").innerHTML =
					coin.market_cap;
				document.querySelector(".coin-circulation-supply").innerHTML =
					coin.circulation_supply;
			}
			colorChange();
		},
	});
};
if (autoRefresh) setInterval(update, autoUpdateInterval);

////////// Search Feature in markets template //////////
let searchInput = document.querySelector(".search");
let displayCoins = document.querySelectorAll(".market-row--coin");
searchInput?.addEventListener("input", function () {
	displayCoins.forEach(function (el) {
		el.style.display = "none";
		if (
			el.dataset.name.toLowerCase().includes(searchInput.value.toLowerCase())
		) {
			el.style.display = "grid";
		}
	});
});

////////// Buy/sell Features in trade template //////////
const tradeBtns = document.querySelectorAll(".trade-btn");
const buyBtn = document.querySelector(".buy-btn");
const sellBtn = document.querySelector(".sell-btn");

const tradeBodies = document.querySelectorAll(".trade-body");
const buyBody = document.querySelector(".trade-body--buy");
const sellBody = document.querySelector(".trade-body--sell");

const spendBuy = document.querySelector("#spend-buy");
const recieveBuy = document.querySelector("#recieve-buy");
const spendSell = document.querySelector("#spend-sell");
const recieveSell = document.querySelector("#recieve-sell");
const curPriceBuy = document.querySelector("#current-price-buy");
const curPriceSell = document.querySelector("#current-price-sell");

const sliderBuy = document.querySelector("#slider-buy");
const sliderSell = document.querySelector("#slider-sell");
const layerBuy = document.querySelector(".layer-buy");
const layerSell = document.querySelector(".layer-sell");
const expireBox = document.querySelector(".expire");
const expireDisplay = document.querySelector(".expire-display");
const expireText = document.querySelector(".expire-text");
const labelTime = document.querySelector(".expire-time");
const cash = parseFloat(document.querySelector("main").dataset.cash);
const bal = parseFloat(document.querySelector("main").dataset.bal);
const coin = document.querySelector("main").dataset.mainCoin;
let priceActive = false;
let currentPrice;
let timer;
let hideTimer;

const initTradeBox = function () {
	spendBuy.value = "";
	recieveBuy.value = "";
	spendSell.value = "";
	recieveSell.value = "";
	curPriceBuy.value = "";
	curPriceSell.value = "";
	layerBuy.style.display = "block";
	layerSell.style.display = "block";
	sliderBuy.value = 0;
	sliderSell.value = 0;
	priceActive = false;
	if (hideTimer) clearTimeout(hideTimer);
	if (timer) clearInterval(timer);
	expireBox.style.display = "none";
};

buyBtn?.addEventListener("click", function () {
	tradeBtns.forEach(function (el) {
		el.classList.remove("trade-btn--active");
	});
	this.classList.add("trade-btn--active");

	tradeBodies.forEach(function (e) {
		e.classList.remove("trade-body--active");
	});
	buyBody.classList.add("trade-body--active");
	initTradeBox();
});

sellBtn?.addEventListener("click", function () {
	tradeBtns.forEach(function (el) {
		el.classList.remove("trade-btn--active");
	});
	this.classList.add("trade-btn--active");

	tradeBodies.forEach(function (e) {
		e.classList.remove("trade-body--active");
	});
	sellBody.classList.add("trade-body--active");
	initTradeBox();
});

////////// Calculate Buy/Sell //////////
// Functions
const getPrice = function () {
	return new Promise((resolve) => {
		$.ajax({
			type: "GET",
			url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d`,
			contentType: "application/json",
			success: function (result) {
				currentPrice = result[0]["current_price"];
				resolve(currentPrice);
				priceActive = true;
			},
		});
	});
};

const calculateAmt = function (value) {
	let digit = currentPrice > 10000 ? 6 : 4;
	return (value / currentPrice).toFixed(digit);
};

const calculateValue = function (value) {
	let digit = currentPrice > 10000 ? 2 : 4;
	return (value * currentPrice).toFixed(digit);
};

const validTrade = function (spend, recieve, layer, valid) {
	let color;
	if (valid === false) {
		color = "red";
		layer.style.display = "block";
	} else {
		color = "#404040";
		layer.style.display = "none";
	}
	spend.style.color = color;
	recieve.style.color = color;
};

const cashInput = function (cash, amount, slider, sliderValue) {
	if (cash.value === "") {
		amount.value = "";
		slider.value = 0;
	} else {
		amount.value = calculateAmt(cash.value);
		slider.value = sliderValue.value;
	}
};

const amtInput = function (cash, amount, slider, sliderValue) {
	if (amount.value === "") {
		cash.value = "";
		slider.value = 0;
	} else {
		cash.value = calculateValue(amount.value);
		slider.value = sliderValue.value;
	}
};

const priceExipreTimer = function () {
	if (hideTimer) clearTimeout(hideTimer);
	expireBox.style.display = "block";
	expireDisplay.style.display = "block";
	expireText.style.display = "none";
	const tick = function () {
		labelTime.textContent = time;

		if (time == 0) {
			clearInterval(timer);
			priceActive = false;
			expireDisplay.style.display = "none";
			expireText.style.display = "block";
			hideTimer = setTimeout(initTradeBox, 1000);
		}
		time--;
	};
	let time = 60;
	tick();
	timer = setInterval(tick, 1000);
};

const refreshPrice = async function () {
	if (priceActive === true) return;
	await getPrice();
	priceExipreTimer();
};

// Event handlers for Buy inputs
spendBuy?.addEventListener("input", async function () {
	await refreshPrice();
	cashInput(spendBuy, recieveBuy, sliderBuy, spendBuy);
	let valid = spendBuy.value < 20 || spendBuy.value > cash ? false : true;
	validTrade(spendBuy, recieveBuy, layerBuy, valid);
});

recieveBuy?.addEventListener("input", async function () {
	await refreshPrice();
	amtInput(spendBuy, recieveBuy, sliderBuy, spendBuy);
	let valid = spendBuy.value < 20 || spendBuy.value > cash ? false : true;
	validTrade(spendBuy, recieveBuy, layerBuy, valid);
});

sliderBuy?.addEventListener("input", async function () {
	await refreshPrice();

	if (this.value == 0) {
		spendBuy.value = "";
		recieveBuy.value = "";
		return;
	} else {
		spendBuy.value = this.value;
		cashInput(spendBuy, recieveBuy, sliderBuy, spendBuy);
		let valid = spendBuy.value < 20 || spendBuy.value > cash ? false : true;
		validTrade(spendBuy, recieveBuy, layerBuy, valid);
	}
});

// Event handlers for Sell inputs
spendSell?.addEventListener("input", async function () {
	await refreshPrice();
	amtInput(recieveSell, spendSell, sliderSell, spendSell);
	let valid = recieveSell.value < 10 || spendSell.value > bal ? false : true;
	validTrade(recieveSell, spendSell, layerSell, valid);
});

recieveSell?.addEventListener("input", async function () {
	await refreshPrice();
	cashInput(recieveSell, spendSell, sliderSell, spendSell);
	let valid = recieveSell.value < 10 || spendSell.value > bal ? false : true;
	validTrade(spendSell, recieveSell, layerSell, valid);
});

sliderSell?.addEventListener("input", async function () {
	await refreshPrice();

	if (this.value == 0) {
		spendSell.value = "";
		recieveSell.value = "";
		return;
	} else {
		spendSell.value = this.value;
		amtInput(recieveSell, spendSell, sliderSell, spendSell);
		let valid = recieveSell.value < 10 || spendSell.value > bal ? false : true;
		validTrade(recieveSell, spendSell, layerSell, valid);
	}
});

// const validate = function () {
// 	if (recieveSell.value < 10) {
// 		return false;
// 	}
// };
