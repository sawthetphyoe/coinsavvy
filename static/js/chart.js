const myCanvas = document.querySelector("#myCanvas");
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

class pieChart {
	constructor(options) {
		this.options = options;
		this.canvas = options.canvas;
		this.ctx = this.canvas.getContext("2d");
		this.colors = options.colors;

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

const myCoins = {};

const myDoungnutChart = new pieChart({
	canvas: myCanvas,
	data: myCoins,
	colors: [
		"#9DA1AA",
		"#1E2460",
		"#E4A010",
		"#7E7B52",
		"#642424",
		"#193737",
		"#A03472",
		"#705335",
		"#E1CC4F",
		"#3E3B32",
		"#8673A1",
		"#CC0605",
		"#a99207",
		"#354D73",
		"#00aa99",
		"#6F4F28",
		"#E55137",
		"#252850",
		"#00BB2D",
		"#4C2F27",
		"#B5B8B1",
		"#CB2821",
		"#424632",
		"#D36E70",
		"#955F20",
		"#1D334A",
		"#6C7156",
		"#A65E2E",
		"#2D572C",
		"#E63244",
		"#008F39",
		"#B44C43",
		"#a5b800",
		"#D53032",
	],
	holeSize: 0.7,
});
myDoungnutChart.draw();
