class Matrix {
	constructor() {
		// console.log("hello");

		this.currentGraph = this.sizeGraph;
		this.svg = d3.select("svg");
		this.margin = 20;
		this.marginAxis = 190;
		this.container = d3.select(this.svg.node().parentNode);
		this.height =
			parseInt(this.svg.style("height")) -
			(this.marginAxis + this.margin);
		this.width =
			parseInt(this.svg.style("width")) / 2 -
			(this.marginAxis + this.margin);
		if (this.width < this.height) this.height = this.width;
		else this.width = this.height;
		this.aspect = this.width / this.height;
		this.xScale = d3.scaleLinear().range([0, this.width]);
		this.yScale = d3.scaleLinear().range([0, this.height]);
		this.g = this.svg
			.append("g")
			.attr("id", "matrix")
			.attr(
				"transform",
				"translate(" + this.marginAxis + "," + this.marginAxis + ")"
			);
		this.loadData();
		// this.graph = new Graph(this.height);
		this.graph = new MapVis(this.height);
	}

	pCorrelation = (x, y) => {
		let sumX = 0,
			sumY = 0,
			sumXY = 0,
			sumX2 = 0,
			sumY2 = 0;
		const minLength = (x.length = y.length = Math.min(x.length, y.length)),
			reduce = (xi, idx) => {
				const yi = y[idx];
				sumX += xi;
				sumY += yi;
				sumXY += xi * yi;
				sumX2 += xi * xi;
				sumY2 += yi * yi;
			};
		x.forEach(reduce);
		return (
			(minLength * sumXY - sumX * sumY) /
			Math.sqrt(
				(minLength * sumX2 - sumX * sumX) *
					(minLength * sumY2 - sumY * sumY)
			)
		);
	};

	loadData = () => {
		this.matrixData = {};
		this.graphData = [];

		d3.csv("data.csv", (d) => {
			Object.keys(d).forEach((column) => {
				if (column !== "") {
					if (this.matrixData[column] == undefined) {
						this.matrixData[column] = [];
					}
					this.matrixData[column].push(d[column]);
				}
			});
			this.graphData.push(d);
		}).then((d) => {
			// console.log(this.graphData);
			this.createCorrelationMatrix();
			this.drawMatrix();
			// this.graph.updateData(
			// 	this.createGraphData(
			// 		"financial freedom score",
			// 		"government effectiveness"
			// 	)
			// );
		});
	};

	updateGraph = (row, column) => {
		if (this.graph.xAxis === row) {
			if (!this.graph.yAxes.includes(column)) {
				let yAxes = this.graph.yAxes.slice();
				yAxes.push(column);
				this.graph.updateData(this.addGraphColumn(column), row, yAxes);
			}
		} else {
			this.graph.updateData(this.createGraphData(row, column), row, [
				column,
			]);
		}
	};

	createGraphData = (x, y) => {
		let data = [];
		for (let i = 4; i < this.graphData.length; i++) {
			if (this.graphData[i][x] != "-" && this.graphData[i][y] != "-") {
				// } else {
				let point = {
					country: this.graphData[i]["ISO Country code"],
					x: Number(this.graphData[i][x].replaceAll(",", "")),
					columns: {},
				};
				point.columns[y] = Number(
					this.graphData[i][y].replaceAll(",", "")
				);
				data.push(point);
			}
		}
		return data;
	};

	addGraphColumn = (column) => {
		let data = this.graph.data;
		let x = this.graph.xAxis;
		for (let i = 4; i < this.graphData.length; i++) {
			if (
				this.graphData[i][x] != "-" ||
				this.graphData[i][column] != "-"
			) {
				// } else {
				let point = data.find(
					(p) => p.country === this.graphData[i]["ISO Country code"]
				);
				if (point === undefined) {
					point = {
						country: this.graphData[i]["ISO Country code"],
						x: Number(this.graphData[i][x].replaceAll(",", "")),
						columns: {},
					};
					data.push(point);
				}
				let string = this.graphData[i][column];
				let repstring = string.replaceAll(",", "");
				let number = Number(repstring);
				point.columns[column] = Number(
					this.graphData[i][column].replaceAll(",", "")
				);
				// console.log(point.columns);
			}
		}
		return this.normaliseData(data, column);
	};

	normaliseData(data, column) {
		let keys = this.graph.yAxes.slice();
		keys.push(column);

		let mins = {};
		let maxes = {};
		keys.forEach((key) => {
			mins[key] = Number.MAX_VALUE;
			maxes[key] = Number.MIN_VALUE;
		});
		data.forEach((point) => {
			keys.forEach((key) => {
				if (point.columns[key] != undefined) {
					if (point.columns[key] < mins[key])
						mins[key] = point.columns[key];
					if (point.columns[key] > maxes[key])
						maxes[key] = point.columns[key];
				}
			});
		});
		data.forEach((point) => {
			keys.forEach((key) => {
				if (point.columns[key] != undefined)
					point.columns[key] =
						(point.columns[key] - mins[key]) /
						(maxes[key] - mins[key]);
			});
		});
		return data;
	}

	cleanArrs = (ar1, ar2) => {
		let a = ar1.slice();
		let b = ar2.slice();
		for (let i = 0; i < a.length; i++) {
			if (a[i] === "-" || b[i] === "-") {
				a.splice(i, 1);
				b.splice(i, 1);
				i--;
			} else {
				a[i] = Number(a[i].replaceAll(",", ""));
				b[i] = Number(b[i].replaceAll(",", ""));
			}
		}
		return [a, b];
	};

	createCorrelationMatrix = () => {
		let columns = Object.keys(this.matrixData);
		columns = columns.slice(2, columns.length);
		this.columns = columns;
		let matrix = {};
		columns.forEach((column) => {
			let colCorrs = {};
			columns.forEach((row) => {
				let arrs = this.cleanArrs(
					this.matrixData[column].slice(
						4,
						this.matrixData[column].length
					),
					this.matrixData[row].slice(4, this.matrixData[row].length)
				);
				colCorrs[row] = this.pCorrelation(arrs[0], arrs[1]);
			});
			matrix[column] = colCorrs;
		});
		this.matrix = matrix;
		this.updateScale(columns.length, this.xScaleVals);
		this.updateScale(columns.length, this.yScaleVals);
	};

	drawMatrix = () => {
		this.setScale();
		this.drawXAxis(this.g);
		this.drawYAxis(this.g);
		this.drawSquares(this.g);
		this.drawTitle();
		let legend = this.g.append("g");
		this.drawLegend(legend);
	};

	drawSquares = (g) => {
		let i = 0;
		this.columns.forEach(function (row) {
			let j = 0;
			this.columns.forEach(function (column) {
				let colour = this.zScale(this.matrix[row][column]);
				g.append("rect")
					.attr("fill", colour)
					.attr("height", this.yScale(1))
					.attr("width", this.xScale(1))
					.attr(
						"transform",
						"translate(" +
							this.xScale(j) +
							"," +
							this.yScale(i) +
							")"
					)
					.on("click", () => this.updateGraph(row, column));
				j++;
			}, this);
			i++;
		}, this);
	};

	setScale = () => {
		this.xScale.domain([0, this.columns.length]);
		this.yScale.domain([0, this.columns.length]);
		this.zScale = d3
			.scaleLinear()
			.domain([-1, 0, 1])
			.range([
				d3.color("#DD7676"),
				d3.color("#100E28"),
				d3.color("#76DD7C"),
			]);
	};

	drawXAxis = (g) => {
		g.append("g")
			.attr("class", "axis xaxis")
			.call(
				d3
					.axisTop(this.xScale)
					.tickFormat((d) => this.formatTicks(d))
					.ticks(this.columns.length)
					.tickSize(0)
			)
			.call((g) =>
				g
					.selectAll(".tick text")
					.attr("transform", "rotate(-90)")
					.attr("x", 10)
					.attr("y", 10)
			)
			.call((g) => g.select(".domain").remove());
	};

	formatTicks = (index) => {
		let string = this.columns[index];
		if (string != undefined) {
			// console.log(string);
			if (string.length > 42) string = string.substring(0, 33) + "...";
			return string;
		}
	};

	drawYAxis = (g) => {
		g.append("g")
			.attr("class", "axis yaxis")
			.call(
				d3
					.axisRight(this.yScale)
					.tickFormat((d) => this.formatTicks(d))
					.ticks(this.columns.length)
					.tickSize(0)
			)
			.call((g) => g.selectAll(".tick text").attr("x", -10).attr("y", 10))
			.call((g) => g.select(".domain").remove());
	};

	updateScale(val, scale) {
		if (!scale.min) scale.min = val;
		if (!scale.max) scale.max = val;

		if (scale.min > val) scale.min = val;
		if (scale.max < val) scale.max = val;
	}

	xScaleVals = {};
	yScaleVals = {};
	zScaleVals = {};
	tScaleVals = {};

	drawTitle() {
		this.g
			.append("text")
			.attr(
				"transform",
				"translate(" + this.width / 2 + "," + (this.height + 50) + ")"
			)
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.text(
				"Correlation Matrix for 'What makes a good government?' dataset"
			);
	}

	drawLegend(g) {
		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", this.zScale(1))
			.attr("class", "legend")
			.attr("transform", "translate(-100, -85)");
		g.append("text")
			.attr("class", "legend")
			.attr("font-size", "10px")
			.attr("transform", "translate(-75, -72)")
			.text("1");
		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", this.zScale(0))
			.attr("class", "legend")
			.attr("transform", "translate(-100, -60)");
		g.append("text")
			.attr("class", "legend")
			.attr("font-size", "10px")
			.attr("transform", "translate(-75, -47)")
			.text("0");
		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", this.zScale(-1))
			.attr("class", "legend")
			.attr("transform", "translate(-100, -35)");
		g.append("text")
			.attr("class", "legend")
			.attr("font-size", "10px")
			.attr("transform", "translate(-75, -22)")
			.text("-1");
	}
}
