"use strict";

////////// Variables to change later //////////
const autoRefresh = true;
const autoUpdateInterval = 6000;

////////// Sticky Nav //////////
// for landing page only
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
// for landing pade, trade page and market page
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
					let coin = result[i];
					let row = document.querySelector(`.${coin.symbol}`);
					if (row) {
						row.querySelector(".coin-price").innerHTML = coin.price;
						row.querySelector(".coin-market-cap").innerHTML = coin.market_cap;
						row.querySelector(".coin-price-change-24h").innerHTML =
							coin.price_change_24h;
					}
				}
			} else if (data.template == "trade") {
				let coin = result[0];
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
