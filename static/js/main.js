// Create number formatter.
const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
	maximumFractionDigits: 6,
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

const update = function () {
	const template = document.querySelector("main").dataset;
	$.ajax({
		type: "POST",
		url: "/update",
		data: JSON.stringify(template),
		contentType: "application/json",
		dataType: "json",
		success: function (result) {
			console.log("success");
			length = Object.keys(result).length;
			for (let i = 0; i < length; i++) {
				coin = result[i];
				row = document.querySelector(`.${coin.symbol}`);
				if (row) {
					row.querySelector(".price").innerHTML = formatter.format(coin.price);
					row.querySelector(".marketcap").innerHTML = `$${coin.market_cap}M`;
					change = row.querySelector(".change");
					if (coin.price_change_24h > 0) {
						change.style.color = "#16a34a";
						change.innerHTML = "+" + coin.price_change_24h.toFixed(2) + "%";
					} else {
						change.style.color = "#dc2626";
						change.innerHTML = coin.price_change_24h.toFixed(2) + "%";
					}
				}
			}
		},
	});
};

// setInterval(update, 6000);

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

// let searchInput = document.querySelector("#search");
// let displayCoins = document.querySelectorAll("#market-row--coin");
// searchInput.addEventListener("input", async function () {
// 	let response = await fetch("/search?q=" + searchInput.value);
// 	let searchCoins = await response.json();
// 	displayCoins.forEach(function (el) {
// 		el.style.display = "none";
// 		for (i = 0; i < searchCoins.length; i++) {
// 			let displaySymbol = searchCoins[i]["symbol"];
// 			if (el.classList.contains(`${displaySymbol}`)) {
// 				el.style.display = "grid";
// 			}
// 		}
// 	});
// });
