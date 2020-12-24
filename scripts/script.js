class Reactor {
	constructor(power = 500, auto = true, minPower = 0, maxPower = 1000) {
		this.power = ko.observable(power);
		this.auto = ko.observable(auto);
		this.MIN_POWER = minPower || 0;
		this.MAX_POWER = maxPower || 1;

		this.getPressure = this.getPressure;
		this.getTemperature = this.getTemperature;
	}

	getPressure() {
		const powerPart = 64 * (this.power() / this.MAX_POWER);
		const error = Math.random() * .5 - .25;

		return 1 + powerPart + error;
	}

	getTemperature() {
		const powerPart = 180 * (this.power() / this.MAX_POWER);
		const error = Math.random() * 1.5 - .75;
	
		return 100 + powerPart + error;
	}
}

class Station {
	constructor(power = 2000, fullManual = false, minPower = 0, maxPower = 4000, reactorsCount = 4) {
		this.reactors = ko.observableArray([]);
		for (let i = 0; i < reactorsCount; this.reactors().push(new Reactor()), i++);

		this.power = ko.observable(power);
		this.fullManual = ko.observable(fullManual);
		this.MIN_POWER = minPower || 0;
		this.MAX_POWER = maxPower || 1;
		this.MIN_REACTOR_POWER = this.reactors()[0].MIN_POWER;
		this.MAX_REACTOR_POWER = this.reactors()[0].MAX_POWER;
		this.updatePowers = this.updatePowers;
	}

	updatePowers() {
		const reactors = this.reactors();

		const manualReactors = reactors
			.filter(reactor => !reactor.auto());
		const availableReactors = reactors
			.filter(reactor => reactor.auto());

		let wholePower = this.power();
		const manualPower = manualReactors
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0);

		let autoPower = Math.floor((wholePower - manualPower) / (availableReactors.length || 1));
		autoPower = autoPower > this.MAX_REACTOR_POWER ? this.MAX_REACTOR_POWER : autoPower;
		autoPower = autoPower < this.MIN_REACTOR_POWER ? this.MIN_REACTOR_POWER : autoPower;
		availableReactors.forEach(reactor => reactor.power(autoPower));

		wholePower = reactors
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0);

		this.power(wholePower);
	}
}

class Controller {
	constructor() {
		const station = new Station();

		this.reactors = station.reactors;
		this.common = {
			reactors: this.reactors,
			power: station.power,
			fullManual: ko.computed(() =>
				station.reactors().every(reactor => !reactor.auto())
			),
			MIN_POWER: station.MIN_POWER,
			MAX_POWER: station.MAX_POWER,
			MIN_REACTOR_POWER: station.MIN_REACTOR_POWER,
			MAX_REACTOR_POWER: station.MAX_REACTOR_POWER,
			updatePowers: station.updatePowers
		};
	}
}

class Information {
	constructor(controller = new Controller()) {
		const reactors = controller.reactors;

		const info = reactors().map((reactor, index) => {
			return {
				index: ko.observable(1 + index),
				name: 'Реактор ' + (1 + index),
				power: ko.observable(reactor.power()),
				pressure: ko.observable(reactor.getPressure()),
				temperature: ko.observable(reactor.getTemperature()),
				getPressure: reactor.getPressure.bind(reactor),
				getTemperature: reactor.getTemperature.bind(reactor)
			};
		});

		info.unshift({
			index: ko.observable(0),
			name: 'Станция',
			power: 2000,
			pressure: ko.computed(() => info
				.map(reactor => reactor.pressure())
				.reduce((cur, acc) => acc += +cur, 0)
				/ info.length),
			temperature: ko.computed(() => info
				.map(reactor => reactor.temperature())
				.reduce((cur, acc) => acc += +cur, 0)
				/ info.length)
		});

		info[0].power = ko.computed(() => Math.floor(info.slice(1)
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0)
		));

		this.info = info;
		this.plots = info.map(module => {
			return {
				x: [],
				y: [],
				mode: 'lines',
				name: module.name,
				line: {width: 3}
			};
		});
	}
}

class View {
	constructor() {
		this.control = new Controller();
		const information = new Information(this.control);
		this.info = information.info;
		this.plots = information.plots;

		this._startObserve();
	}

	_startObserve() {
		const _calcaluteInfo = () => {
			const _addPoint = (points, pointX, pointY) => {
				const MAX_POINTS = 180;
				const x = points.x;
				const y = points.y;
	
				if (x.length > MAX_POINTS)
					x.shift();
				if (y.length > MAX_POINTS)
					y.shift();
	
				x.push(pointX);
				y.push(pointY);
			};

			const reactors = this.info.slice(1);

			reactors.forEach(reactor => {
				const curPower = reactor.power();
				const targetPower = this.control.reactors()[reactor.index() - 1].power();

				
				const absDiff = targetPower - curPower;
				const multiplyer = Math.abs(absDiff) < 10 ? 1 : .2;

				const resultPower = reactor.power() + absDiff * multiplyer;
				const resultPressure = reactor.getPressure();
				const resultTemperature = reactor.getTemperature();

				reactor.power(resultPower);
				reactor.pressure(resultPressure);
				reactor.temperature(resultTemperature);
			});

			let date = new Date(2020, 12, 30, 0, 0, seconds++);
			date = date.toLocaleTimeString();

			this.plots.forEach((plot, index) => {
				_addPoint(plot, date, this.info[index].power());
			});
		}

		const _drawPlot = () => {
			Plotly.newPlot('plot', this.plots, {
				title:'Статистика работы станции',
				showlegend: true,
				xaxis: {
					title: 'Время'
				},
				yaxis: {
					title: 'Мощность',
					range: [0, 4000]
				},
				height: 400
			});
		};

		let seconds = 0;
		setInterval(() => {
			_calcaluteInfo();
			_drawPlot();
		}, 1000);
	}
}

ko.applyBindings(new View());