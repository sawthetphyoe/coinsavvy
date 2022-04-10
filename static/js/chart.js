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

// drawLine(ctx, 100, 100, 200, 200);
// drawArc(ctx, 150, 150, 150, 0, Math.PI / 3);
// drawPieSlice(
// 	ctx,
// 	150,
// 	150,
// 	150,
// 	Math.PI / 2,
// 	Math.PI / 2 + Math.PI / 4,
// 	"#ff0000"
// );

// console.log(typeof ctx);
// console.log(ctx);

const myVinyls = {
	Classical: 10,
	Alternative: 10,
	Pop: 5,
	Jazz: 10,
	Rap: 3,
	Ro: 5,
	Rck: 5,
	// k: 5,
	// kpop: 5,
	// raggae: 5,
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

const myPiechart = new pieChart({
	canvas: myCanvas,
	data: myVinyls,
	colors: ["#fde23e", "#f16e23", "#57d9ff", "#937e88"],
});
// myPiechart.draw();

const myDoungnutChart = new pieChart({
	canvas: myCanvas,
	data: myVinyls,
	colors: [
		"#5F6A6A",
		"#003f5c",
		"#58508d",
		"#bc5090",
		"#a99207",
		"#ffa600",
		"#5DADE2",
		"#302a02",
		"#6E2C00",
		"#f4d93b",
	],
	holeSize: 0.7,
});
myDoungnutChart.draw();
