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

buyBtn.addEventListener("click", function () {
	tradeBtns.forEach(function (el) {
		el.classList.remove("trade-btn--active");
	});
	this.classList.add("trade-btn--active");

	tradeBodies.forEach(function (e) {
		e.classList.remove("trade-body--active");
	});
	buyBody.classList.add("trade-body--active");
});

sellBtn.addEventListener("click", function () {
	tradeBtns.forEach(function (el) {
		el.classList.remove("trade-btn--active");
	});
	this.classList.add("trade-btn--active");

	tradeBodies.forEach(function (e) {
		e.classList.remove("trade-body--active");
	});
	sellBody.classList.add("trade-body--active");
});
