"use strict";

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
