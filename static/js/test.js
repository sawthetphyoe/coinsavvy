// Create number formatter.
const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",

	// These options are needed to round to whole numbers if that's what you want.
	minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
	maximumFractionDigits: 6, // (causes 2500.99 to be printed as $2,501)
});

const items = document.querySelectorAll(".items");

items.forEach(function (el) {
	change = el.querySelector(".change");
	if (parseFloat(change.innerHTML) > 0) {
		change.style.color = "green";
	} else {
		change.style.color = "red";
	}
});

const auto = function () {
	$.ajax({
		type: "GET",
		url: "/update",
		dataType: "json",
		success: function (result) {
			length = Object.keys(result).length;
			for (let i = 0; i < length; i++) {
				coin = result[i];
				row = document.querySelector(`.${coin.symbol}`);
				if (row) {
					row.querySelector(".price").innerHTML = formatter.format(coin.price);
					row.querySelector(".marketcap").innerHTML = `$${coin.market}M`;
					change = row.querySelector(".change");
					if (coin.change > 0) {
						change.style.color = "#16a34a";
						change.innerHTML = "+" + coin.change.toFixed(2) + "%";
					} else {
						change.style.color = "#dc2626";
						change.innerHTML = coin.change.toFixed(2) + "%";
					}
				}
			}
		},
	});
};

setInterval(auto, 6000);

const observeEl = document.querySelector(".observe");

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
obs.observe(observeEl);

let searchInput = document.querySelector("#search");
let displayCoins = document.querySelectorAll("#market-row--coin");
searchInput.addEventListener("input", async function () {
	let response = await fetch("/search?q=" + searchInput.value);
	let searchCoins = await response.json();
	displayCoins.forEach(function (el) {
		el.style.display = "none";
		for (i = 0; i < searchCoins.length; i++) {
			let displaySymbol = searchCoins[i]["symbol"];
			if (el.classList.contains(`${displaySymbol}`)) {
				el.style.display = "grid";
			}
		}
	});
});
