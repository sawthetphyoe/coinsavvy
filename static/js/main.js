// Create number formatter.
const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
	maximumFractionDigits: 6,
});

const colorChange = () => {
	const items = document.querySelectorAll(".items");
	items.forEach(function (el) {
		change = el.querySelector(".change");
		if (parseFloat(change.innerHTML) > 0) {
			change.style.color = "#16a34a";
		} else {
			change.style.color = "#dc2626";
		}
	});
};

colorChange();

const update = function () {
	const template = document.querySelector("main").dataset;
	$.ajax({
		type: "POST",
		url: "/update",
		data: JSON.stringify(template),
		contentType: "application/json",
		dataType: "json",
		success: function (result) {
			length = Object.keys(result).length;
			for (let i = 0; i < length; i++) {
				coin = result[i];
				row = document.querySelector(`.${coin.symbol}`);
				if (row) {
					row.querySelector(".price").innerHTML = coin.price;
					row.querySelector(".marketcap").innerHTML = coin.market_cap;
					row.querySelector(".change").innerHTML = coin.price_change_24h;
					colorChange();
				}
			}
		},
	});
};

setInterval(update, 6000);

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
