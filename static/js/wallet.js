"use strict";

// Create our number formatter.
const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",

	// These options are needed to round to whole numbers if that's what you want.
	minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
	maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
});

////////// Variables //////////
const portfolioBoxes = document.querySelectorAll(".portfolio-coins");
const totalCapital = document.querySelector(".total-amount");
const totalPnl = document.querySelector(".pnl-content");

let portfolioCoins = [];
let coinDatas = {};
let mySymbols = [];
let labelExist = false;
const mycolors = [
	"#9DA1AA",
	"#1E2460",
	"#E1CC4F",
	"#E55137",
	"#7E7B52",
	"#642424",
	"#80aB1D",
	"#193737",
	"#A03472",
	"#705335",
];

////////// Get initial data from template //////////
portfolioBoxes.forEach(function (el) {
	let coinId = el.dataset.coinId;
	if (coinId !== "usd") portfolioCoins.push(coinId);
	let amt = parseFloat(parseFloat(el.dataset.amount).toFixed(4));
	let initPrice = parseFloat(el.dataset.initPrice);
	let initValue = parseFloat((amt * initPrice).toFixed(4));
	let coinData = {
		amount: amt,
		initialPrice: initPrice,
		initialValue: initValue,
		currentPrice: 1,
		currentValue: amt,
	};
	let symbol = el.querySelector(".portfolio-coin--name").textContent;
	mySymbols.push(symbol);
	coinDatas[`${coinId}`] = coinData;
});

////////// For Chart //////////
const myCanvas = document.querySelector("#myCanvas");
const labelBox = document.querySelector(".label-box");
myCanvas.width = 175;
myCanvas.height = 175;

const ctx = myCanvas.getContext("2d");

const drawLine = function (ctx, startX, startY, endX, endY) {
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
};

const drawArc = function (ctx, centerX, centerY, radius, startAngle, endAngle) {
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, startAngle, endAngle);
	ctx.stroke();
};

const drawPieSlice = function (
	ctx,
	centerX,
	centerY,
	radius,
	startAngle,
	endAngle,
	color
) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.arc(centerX, centerY, radius, startAngle, endAngle);
	ctx.closePath();
	ctx.fill();
};

const insertLabel = function (symbol, percent, colorCode) {
	if (labelExist) {
		document.querySelector(".label-percent").textContent = `${percent}%`;
		return;
	}
	let node = document.createElement("div");
	node.classList.add("label");
	let colorSquare = document.createElement("span");
	colorSquare.classList.add("label-color");
	colorSquare.style.backgroundColor = colorCode;
	node.appendChild(colorSquare);
	let coinLabel = document.createElement("span");
	coinLabel.classList.add("label-coin");
	coinLabel.textContent = `${symbol}`;
	node.appendChild(coinLabel);
	let percentLabel = document.createElement("span");
	percentLabel.classList.add("label-percent");
	percentLabel.textContent = `${percent}%`;
	node.appendChild(percentLabel);
	labelBox.appendChild(node);
};

// Create a donut chart class
class pieChart {
	constructor(options) {
		this.options = options;
		this.canvas = options.canvas;
		this.ctx = this.canvas.getContext("2d");
		this.colors = options.colors;
		this.symbols = this.options.symbols;

		this.draw = function () {
			let total_value = 0;
			let color_index = 0;
			for (let categ in this.options.data) {
				let val = this.options.data[categ];
				total_value += val;
			}

			let start_angle = -0.5 * Math.PI;
			for (let categ in this.options.data) {
				let val = this.options.data[categ];
				let slice_angle = (2 * Math.PI * val) / total_value;

				drawPieSlice(
					this.ctx,
					this.canvas.width / 2,
					this.canvas.height / 2,
					Math.min(this.canvas.width / 2, this.canvas.height / 2),
					start_angle,
					start_angle + slice_angle,
					this.colors[color_index % this.colors.length]
				);

				insertLabel(
					this.symbols[color_index % this.colors.length],
					((val / total_value) * 100).toFixed(2),
					this.colors[color_index % this.colors.length]
				);

				start_angle += slice_angle;
				color_index++;
			}

			if (this.options.holeSize) {
				drawPieSlice(
					this.ctx,
					this.canvas.width / 2,
					this.canvas.height / 2,
					this.options.holeSize *
						Math.min(this.canvas.width / 2, this.canvas.height / 2),
					0,
					2 * Math.PI,
					"#fafafa"
				);
			}
		};
	}
}

////////// Functions //////////
const getPrices = function () {
	return new Promise((resolve) => {
		$.ajax({
			type: "GET",
			url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${portfolioCoins.join(
				"%2C"
			)}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d`,
			contentType: "application/json",
			success: function (result) {
				result.forEach(function (coin) {
					for (const [key, value] of Object.entries(coinDatas)) {
						if (key == coin["id"]) {
							value.currentPrice = parseFloat(
								parseFloat(coin["current_price"]).toFixed(4)
							);
							value.currentValue = parseFloat(
								(value.amount * coin["current_price"]).toFixed(4)
							);
						}
					}
				});
				resolve(coinDatas);
			},
		});
	});
};

const updateUI = async function () {
	let currentTotal = 0;
	let myCoins = {};
	await getPrices();
	for (const [coin, data] of Object.entries(coinDatas)) {
		currentTotal += data.currentValue;
		let coinBox = document.querySelector(`#${coin}`);
		coinBox.querySelector(".portfolio-value").textContent = formatter.format(
			data.currentValue
		);
		myCoins[`${coin}`] = data.currentValue;
		if (coin !== "usd") {
			let pnlValue = data.currentValue - data.initialValue;
			coinBox.querySelector(".portfolio-pnlvalue").textContent =
				formatter.format(pnlValue);
			let pnlPercent = (pnlValue / data.initialValue) * 100;
			let pnlPercentBox = coinBox.querySelector(".portfolio-pnlpercent");
			pnlPercentBox.textContent = pnlPercent.toFixed(2) + "%";
			pnlPercentBox.style.color = pnlValue >= 0 ? "green" : "red";
		}
	}
	let pnlTotal = ((currentTotal - 10000) / 10000) * 100;
	totalPnl.textContent = `${pnlTotal.toFixed(2)}%`;
	totalPnl.style.color = pnlTotal >= 0 ? "green" : "red";
	totalCapital.textContent = formatter.format(currentTotal);

	let myDoungnutChart = new pieChart({
		symbols: mySymbols,
		canvas: myCanvas,
		data: myCoins,
		colors: mycolors,
		holeSize: 0.7,
	});
	myDoungnutChart.draw();
	labelExist = true;
};
updateUI();
setInterval(updateUI, 60000);
