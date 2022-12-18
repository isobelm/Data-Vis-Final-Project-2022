// import {geoEqualEarth, geoPath} from "https://cdn.skypack.dev/d3-geo@3";
class MapVis {
	constructor(size) {
		this.svg = d3.select("svg");
		this.margin = 100;
		this.marginAxis = 190;
		this.container = d3.select(this.svg.node().parentNode);
		this.height = size;
		this.width = size;
		// this.xScale = d3.scaleLinear().range([0, size]);
		// this.yScale = d3.scaleLinear().range([size, 0]);
		this.g = this.svg
			.append("g")
			.attr("id", "map")
			.attr(
				"transform",
				"translate(" +
					(this.margin + parseInt(this.svg.style("width")) / 2) +
					"," +
					this.marginAxis +
					")"
			);
		this.svg
			.append("defs")
			.append("pattern")
			.attr("id", "wavyPattern")
			.attr("width", 10)
			.attr("height", 6)
			.attr("patternUnits", "userSpaceOnUse")
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "#fff")
			.attr("stroke-width", "2")
			.attr("d", "M0,1.5 Q2.5,4.5  5,2 T 10,1.5");
		this.svg
			.append("defs")
			.append("mask")
			.attr("id", "mask")
			.attr("width", 5)
			.attr("height", 5)
			.attr("x", -2)
			.attr("y", -2)
			.append("rect")
			.attr("width", 50000)
			.attr("height", 50000)
			.attr("x", -1000)
			.attr("y", -1000)
			// .attr("patternUnits", "userSpaceOnUse")
			// .append("path")
			.attr("fill", "url(#wavyPattern)");
		// .attr("stroke", "#335553")
		// .attr("stroke-width", "2")
		// .attr("d", "M0,1.5 Q2.5,4.5  5,2 T 10,1.5");
		this.data = [];
		this.path = d3.geoPath();
		this.projection = d3
			.geoEqualEarth()
			.scale(140)
			.center([10, 0])
			.translate([this.width / 2, this.height / 2]);

		this.loadData();
	}

	updateData = (data, x, ys) => {
		this.data = data;
		this.xAxis = x;
		this.yAxis = ys[0];
		// this.updateColours();
		this.setScale();
		this.removeDrawing();
		this.drawGraph();
	};

	// updateColours = () => {
	// 	this.yAxes.forEach((column) => {
	// 		if (this.colours[column] === undefined) {
	// 			this.colours[column] = `hsl(${Math.random() * 360}, 70%, ${
	// 				57 + Math.random() * 10
	// 			}%)`;
	// 			// console.log(this.colours[column]);
	// 		}
	// 	});
	// };

	removeDrawing = () => {
		// d3.selectAll(".gaxis").remove();
		d3.selectAll(".map").remove();
		d3.selectAll(".mlegend").remove();
	};

	loadData = async () => {
		// Promise.all([
		this.geoData = await d3.json(
			"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
		);
		this.drawGraph();
	};

	drawGraph = () => {
		this.drawMap();

		// this.setScale();
		// this.drawXAxis(this.g);

		// if (this.yAxes.length < 2) this.drawYAxis(this.g);

		// let dataPoints = this.g.append("g");

		// this.drawPoints(dataPoints);

		// this.drawTitle();
		if (this.xAxis != undefined) {
			let legend = this.g.append("g");
			this.drawLegend(legend);
		}
	};

	drawMap = () => {
		// let width = this.width;
		// let height = this.height;
		// var path = d3.geoPath();

		// Load external data and boot
		// Promise.all([
		// 	d3.json(
		// 		"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
		// 	),
		// 	// d3.csv(
		// 	// 	"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
		// 	// 	function (d) {
		// 	// 		data.set(d.code, +d.pop);
		// 	// 	}
		// 	// ),
		// ]).then((loadData) => {
		let topo = this.geoData;
		console.log(this.geoData);

		// Draw the map
		this.g
			.append("g")
			.attr("class", "map")
			.selectAll("path")
			.data(topo.features)
			.join("path")
			// draw each country
			.attr("d", d3.geoPath().projection(this.projection))
			// set the color of each country
			.attr("fill", (d) => {
				// d.total = data.get(d.id) || 0;
				let point = this.data.find((point) => d.id === point.country);
				let color;
				if (point === undefined) color = d3.color("#27253F");
				else color = this.xScale(point.x);
				return color;
			});
		this.g
			.append("g")
			.attr("class", "map")
			.selectAll("path")
			.data(topo.features)
			.join("path")
			// draw each country
			.attr("d", d3.geoPath().projection(this.projection))
			// set the color of each country
			.attr("mask", "url(#mask)")
			.attr("fill", (d) => {
				// d.total = data.get(d.id) || 0;
				let point = this.data.find((point) => d.id === point.country);
				let color;
				if (point === undefined) color = d3.color("#27253F");
				else color = this.yScale(point.columns[this.yAxis]);
				return color;
			});
		// });
	};

	setScale() {
		// this.xScale.domain([
		// 	d3.min(this.data, (d) => {
		// 		return d.x;
		// 	}),
		// 	d3.max(this.data, (d) => {
		// 		return d.x;
		// 	}),
		// ]);
		// // xScale.ticks(6);
		// // let columns = Object.keys(this.data[0].columns);
		// if (this.yAxes.length === 1)
		// 	this.yScale.domain([
		// 		d3.min(this.data, (d) => {
		// 			return d.columns[this.yAxes[0]];
		// 		}),
		// 		d3.max(this.data, (d) => {
		// 			return d.columns[this.yAxes[0]];
		// 		}),
		// 	]);
		// else this.yScale.domain([0, 1]);

		// this.columnWidth = (this.xScale.bandwidth() / 0.8) * 1;
		// this.paddingCorrection =
		// 	(this.xScale.bandwidth() - this.columnWidth) / 2;
		this.xScale = d3
			.scaleLinear()
			.domain([
				d3.min(this.data, (d) => {
					return d.x;
				}),
				d3.max(this.data, (d) => {
					return d.x;
				}),
			])
			.range([
				d3.color("#C4C2D7"),
				// d3.color("#100E28"),
				d3.color("#B47500"),
			]);
		this.yScale = d3
			.scaleLinear()
			.domain([
				d3.min(this.data, (d) => {
					return d.columns[this.yAxis];
				}),
				d3.max(this.data, (d) => {
					return d.columns[this.yAxis];
				}),
			])
			.range([
				d3.color("#C4C2D7"),
				// d3.color("#100E28"),
				d3.color("#B47500"),
			]);
	}

	// drawXAxis(g) {
	// 	let background = g.append("g");
	// 	background
	// 		.append("rect")
	// 		// .attr("x", this.xScale(i) + paddingCorrection)
	// 		// .attr("y", 0)
	// 		.attr("height", this.height)
	// 		.attr("width", this.width)
	// 		.attr("fill", "#27253F");

	// 	// for (let i = 1952; i <= 2007; i += 5) {
	// 	// 	if ((i - 2) % 10 === 0) {
	// 	// 		background
	// 	// 			.append("rect")
	// 	// 			.attr("x", this.xScale(i) + this.paddingCorrection)
	// 	// 			.attr("y", 0)
	// 	// 			.attr("height", this.height)
	// 	// 			.attr("width", this.columnWidth)
	// 	// 			.attr("fill", "#201C47");
	// 	// 	}
	// 	// }
	// 	g.append("g")
	// 		.attr("transform", "translate(0," + this.height + ")")
	// 		.attr("class", "gaxis gxaxis")
	// 		.call(d3.axisBottom(this.xScale))
	// 		.append("text")
	// 		.attr("y", 30)
	// 		.attr("x", this.width)
	// 		.attr("fill", "#fff")
	// 		.attr("text-anchor", "end")
	// 		.text(this.xAxis);
	// }

	// drawYAxis(g) {
	// 	g.append("g")
	// 		.attr("class", "gaxis gyaxis")
	// 		.call(
	// 			d3
	// 				.axisRight(this.yScale)
	// 				.tickFormat(function (d) {
	// 					return d;
	// 				})
	// 				.ticks(10)
	// 			// .tickSize(this.width)
	// 		)
	// 		.call((g) => g.selectAll(".tick text").attr("x", -10))
	// 		.append("text")
	// 		.attr("transform", "rotate(-90)")
	// 		.attr("y", "-70")
	// 		.attr("fill", "#fff");
	// 	// .text("Life Expectancy");
	// }

	// drawPoints(g) {
	// 	// let i = 0;
	// 	this.data.forEach((point) => {
	// 		Object.keys(point.columns).forEach((column) => {
	// 			// console.log("x: " + point.x + "\tsx: " + this.xScale(point.x));
	// 			this.drawCircle(g)
	// 				.attr("class", "point")
	// 				.attr("fill", this.colours[column])
	// 				// .attr("fill-opacity", 0.4)
	// 				.attr(
	// 					"transform",
	// 					"translate(" +
	// 						this.xScale(point.x) +
	// 						// (i % this.xScale.bandwidth())) +
	// 						"," +
	// 						this.yScale(point.columns[column]) +
	// 						")"
	// 				);
	// 		});
	// 	});
	// }

	// drawCircle = (g) => {
	// 	return g.append("circle").attr("r", 3);
	// };

	drawTitle() {
		this.g
			.append("g")
			.append("text")
			.attr("class", "title")
			.attr(
				"transform",
				"translate(" + this.width / 2 + "," + (this.height + 50) + ")"
			)
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.text("Selected data series");
	}

	drawLegend(g) {
		// this.yAxes.forEach((column) => {
		g.append("rect")
			.attr("width", 60)
			.attr("height", 20)
			.attr("fill", "#DD7676")
			.attr("class", "mlegend")
			.attr("transform", "translate(0," + -40 + ")");
		g.append("text")
			.attr("class", "mlegend")
			.attr("font-size", "10px")
			.attr("fill", "#DD7676")
			.attr("transform", "translate(70," + -35 + ")")
			.text(this.xAxis);
		g.append("rect")
			.attr("width", 60)
			.attr("height", 20)
			.attr("mask", "url(#mask)")
			.attr("fill", "#787BDE")
			.attr("class", "mlegend")
			.attr("transform", "translate(0," + -40 + ")");
		g.append("text")
			.attr("class", "mlegend")
			.attr("font-size", "10px")
			.attr("fill", "#787BDE")
			.attr("transform", "translate(70," + -20 + ")")
			.text(this.yAxis);
		// g.append("text")
		// 	.attr("class", "glegend")
		// 	.attr("font-size", "10px")
		// 	.attr("transform", "translate(10," + (-20 * i - 17) + ")")
		// 	.text(column);

		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", "#B47500")
			.attr("class", "mlegend")
			.attr("transform", "translate(" + (this.width - 100) + ", -40)");
		g.append("text")
			.attr("class", "mlegend")
			.attr("font-size", "10px")
			.attr("transform", "translate(" + (this.width - 140) + ", -27)")
			.text("highest");
		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", "#C4C2D7")
			.attr("class", "mlegend")
			.attr("transform", "translate(" + (this.width - 100) + ", -60)");
		g.append("text")
			.attr("class", "mlegend")
			.attr("font-size", "10px")
			.attr("transform", "translate(" + (this.width - 140) + ", -47)")
			.text("lowest");
		// g.append("rect")
		// 	.attr("width", 20)
		// 	.attr("height", 20)
		// 	.attr("fill", this.zScale(0))
		// 	.attr("class", "legend")
		// 	.attr("transform", "translate(-100, -60)");
		// g.append("text")
		// 	.attr("class", "legend")
		// 	.attr("font-size", "10px")
		// 	.attr("transform", "translate(-75, -47)")
		// 	.text("0");
		// g.append("rect")
		// 	.attr("width", 20)
		// 	.attr("height", 20)
		// 	.attr("fill", this.zScale(-1))
		// 	.attr("class", "legend")
		// 	.attr("transform", "translate(-100, -35)");
		// g.append("text")
		// 	.attr("class", "legend")
		// 	.attr("font-size", "10px")
		// 	.attr("transform", "translate(-75, -22)")
		// 	.text("-1");
		// });
	}

	// shapes = {
	// 	Africa: this.drawCircle,
	// 	Americas: this.drawTriangle,
	// 	Asia: this.drawUpTriangle,
	// 	Europe: this.drawDiamond,
	// 	Oceania: this.drawSquare,
	// };
}
