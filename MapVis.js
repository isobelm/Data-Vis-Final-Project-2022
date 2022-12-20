// import {geoEqualEarth, geoPath} from "https://cdn.skypack.dev/d3-geo@3";
class MapVis {
	constructor(size, svg, container) {
		this.svg = svg;
		this.margin = 100;
		this.marginAxis = 190;
		this.container = container;
		this.height = size;
		this.width = size;

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
			.attr("fill", "url(#wavyPattern)");
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

	delete = () => {
		d3.selectAll(".map").remove();
	};

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
		// this.drawGraph();
	};

	drawGraph = () => {
		this.g = this.svg
			.append("g")
			.attr("id", "map")
			.attr("class", "map")
			.attr(
				"transform",
				"translate(" +
					(this.margin + parseInt(this.svg.style("width")) / 2) +
					"," +
					this.marginAxis +
					")"
			);
		this.drawMap();

		this.drawTitle();
		if (this.xAxis != undefined) {
			let legend = this.g.append("g");
			this.drawLegend(legend);
		}
	};

	drawMap = () => {
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

		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", "#B47500")
			.attr("class", "mlegend")
			.attr("transform", "translate(" + (this.width - 20) + ", -40)");
		g.append("text")
			.attr("class", "mlegend")
			.attr("font-size", "10px")
			.attr("transform", "translate(" + (this.width - 30) + ", -27)")
			.attr("text-anchor", "end")
			.text("highest");
		g.append("rect")
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", "#C4C2D7")
			.attr("class", "mlegend")
			.attr("transform", "translate(" + (this.width - 20) + ", -60)");
		g.append("text")
			.attr("class", "mlegend")
			.attr("font-size", "10px")
			.attr("transform", "translate(" + (this.width - 30) + ", -47)")
			.attr("text-anchor", "end")
			.text("lowest");
	}

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
			.text("Map representation of selected data series");
	}
}
