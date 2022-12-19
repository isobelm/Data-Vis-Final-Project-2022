class Graph {
	constructor(size, svg, container) {
		this.svg = svg;
		this.margin = 100;
		this.marginAxis = 190;
		this.container = container;
		this.height = size;
		this.width = size;
		this.xScale = d3.scaleLinear().range([0, size]);
		this.yScale = d3.scaleLinear().range([size, 0]);

		this.colours = {};

		// this.loadData();
	}

	delete = () => {
		d3.selectAll(".scatter").remove();
	};

	updateData = (data, x, ys) => {
		this.data = data;
		this.xAxis = x;
		this.yAxes = ys;
		this.updateColours();
		this.removeDrawing();
		this.drawGraph();
	};

	updateColours = () => {
		this.yAxes.forEach((column) => {
			if (this.colours[column] === undefined) {
				this.colours[column] = `hsl(${Math.random() * 360}, 70%, ${
					57 + Math.random() * 10
				}%)`;
				// console.log(this.colours[column]);
			}
		});
	};

	removeDrawing = () => {
		d3.selectAll(".gaxis").remove();
		d3.selectAll(".point").remove();
		d3.selectAll(".glegend").remove();
	};

	drawGraph = () => {
		this.g = this.svg
			.append("g")
			.attr("id", "graph")
			.attr("class", "scatter")
			.attr(
				"transform",
				"translate(" +
					(this.margin + parseInt(this.svg.style("width")) / 2) +
					"," +
					this.marginAxis +
					")"
			);
		this.setScale();
		this.drawXAxis(this.g);

		if (this.yAxes.length < 2) this.drawYAxis(this.g);

		let dataPoints = this.g.append("g");

		this.drawPoints(dataPoints);

		this.drawTitle();
		let legend = this.g.append("g");

		this.drawLegend(legend, false);
	};

	setScale() {
		this.xScale.domain([
			d3.min(this.data, (d) => {
				return d.x;
			}),
			d3.max(this.data, (d) => {
				return d.x;
			}),
		]);
		if (this.yAxes.length === 1)
			this.yScale.domain([
				d3.min(this.data, (d) => {
					return d.columns[this.yAxes[0]];
				}),
				d3.max(this.data, (d) => {
					return d.columns[this.yAxes[0]];
				}),
			]);
		else this.yScale.domain([0, 1]);
	}

	drawXAxis(g) {
		let background = g.append("g");
		background
			.append("rect")
			.attr("height", this.height)
			.attr("width", this.width)
			.attr("fill", "#27253F");

		g.append("g")
			.attr("transform", "translate(0," + this.height + ")")
			.attr("class", "gaxis gxaxis")
			.call(d3.axisBottom(this.xScale))
			.append("text")
			.attr("y", 30)
			.attr("x", this.width)
			.attr("fill", "#fff")
			.attr("text-anchor", "end")
			.text(this.xAxis);
	}

	drawYAxis(g) {
		g.append("g")
			.attr("class", "gaxis gyaxis")
			.call(
				d3
					.axisRight(this.yScale)
					.tickFormat(function (d) {
						return d;
					})
					.ticks(10)
				// .tickSize(this.width)
			)
			.call((g) => g.selectAll(".tick text").attr("x", -10))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", "-70")
			.attr("fill", "#fff");
		// .text("Life Expectancy");
	}

	drawPoints(g) {
		// let i = 0;
		this.data.forEach((point) => {
			Object.keys(point.columns).forEach((column) => {
				// console.log("x: " + point.x + "\tsx: " + this.xScale(point.x));
				let x = this.xScale(point.x);
				let y = this.yScale(point.columns[column]);
				if (x !== undefined && y !== undefined)
					this.drawCircle(g)
						.attr("class", "point")
						.attr("fill", this.colours[column])
						// .attr("fill-opacity", 0.4)
						.attr("transform", "translate(" + x + "," + y + ")");
			});
		});
	}

	drawCircle = (g) => {
		return g.append("circle").attr("r", 3);
	};

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
		let i = 0;
		this.yAxes.forEach((column) => {
			this.drawCircle(g)
				.attr("fill", this.colours[column])
				.attr("class", "glegend")
				.attr("transform", "translate(0," + (-20 * i - 20) + ")");

			g.append("text")
				.attr("class", "glegend")
				.attr("font-size", "10px")
				.attr("transform", "translate(10," + (-20 * i - 17) + ")")
				.text(column);

			i++;
		});
	}

	// shapes = {
	// 	Africa: this.drawCircle,
	// 	Americas: this.drawTriangle,
	// 	Asia: this.drawUpTriangle,
	// 	Europe: this.drawDiamond,
	// 	Oceania: this.drawSquare,
	// };
}
