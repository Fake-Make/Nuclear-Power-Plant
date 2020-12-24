class Station {
	constructor() {
		const reactors = [1, 2, 3, 4]
			.map(_ => {
				return {
					power: ko.observable(500),
					auto: ko.observable(true)
				}
			});

		this.control = {
			reactors: reactors,
			common: {
				power: ko.observable(2000)
			}
		};

		this.control.common.fullManual = ko.computed(() =>
			this.control.reactors.every(reactor => !reactor.auto())
		);

		const info = reactors.map((reactor, index) => {
			return {
				index: ko.observable(1 + index),
				name: 'Реактор ' + (1 + index),
				power: ko.observable(reactor.power()),
				pressure: ko.observable(this._getPressure(reactor.power())),
				temperature: ko.observable(this._getTemperature(reactor.power()))
			};
		});

		info.unshift({
			index: ko.observable(0),
			name: 'Станция',
			power: ko.observable(2000),
			pressure: ko.observable(info
				.map(reactor => reactor.pressure)
				.reduce((cur, acc) => acc += +cur, 0)
				/ info.length),
			temperature: ko.observable(info
				.map(reactor => reactor.temperature)
				.reduce((cur, acc) => acc += +cur, 0)
				/ info.length)
		});

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

		this.updatePowers = this.updatePowers;
		this._updateInfo();
	}

	_getPressure(power, maxPower = 1000) {
		const powerPart = 64 * (power / maxPower);
		const error = Math.random() * .5 - .25;
	
		return 1 + powerPart + error;
	}

	_getTemperature(power, maxPower = 1000) {
		const powerPart = 180 * (power / maxPower);
		const error = Math.random() * 1.5 - .75;
	
		return 100 + powerPart + error;
	}

	_updateValue(field) {
		console.log(field, this)
		const value = field.value;
		const fieldName = field.name;
		const fieldsToChange = document.getElementsByName(fieldName);
	
		for (let i = 0; fieldToChange = fieldsToChange[i]; i++) {
			fieldToChange.value = value;
		}
	}

	updatePowers() {
		const reactors = this.control.reactors();
		const common = this.control.common;

		const manualReactors = reactors
			.filter(reactor => !reactor.auto());
		const availableReactors = reactors
			.filter(reactor => reactor.auto());

		let wholePower = common.power();
		const manualPower = manualReactors
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0);

		let autoPower = Math.floor((wholePower - manualPower) / availableReactors.length);
		autoPower = autoPower > 1000 ? 1000 : autoPower;
		availableReactors.forEach(reactor => reactor.power(autoPower));

		wholePower = reactors
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0);
		common.power(wholePower);
	}

	_updateInfo() {
		const _addPoint = (points, pointX, pointY) => {
			const maxPoints = 60;
			const x = points.x;
			const y = points.y;

			if (x.length > maxPoints)
				x.shift();
			if (y.length > maxPoints)
				y.shift();

			x.push(pointX);
			y.push(pointY);
		};

		const _calcaluteInfo = () => {
			const reactors = this.info.slice(1);

			reactors.forEach(reactor => {
				const curPower = reactor.power();
				const targetPower = this.control.reactors[reactor.index() - 1].power();

				const absDiff = targetPower - curPower;
				const multiplyer = Math.abs(absDiff) < 10 ? 1 : .2;

				const resultPower = reactor.power() + absDiff * multiplyer;
				const resultPressure = this._getPressure(resultPower);
				const resultTemperature = this._getTemperature(resultPower);

				reactor.power(resultPower);
				reactor.pressure(resultPressure);
				reactor.temperature(resultTemperature);
			});

			const average = this.info[0];
			average.power(Math.floor(reactors
				.map(reactor => reactor.power())
				.reduce((acc, cur) => acc += +cur, 0)
			));

			average.pressure(reactors
				.map(reactor => reactor.pressure())
				.reduce((acc, cur) => acc += +cur, 0)
				/ reactors.length
			);

			average.temperature(reactors
				.map(reactor => reactor.temperature())
				.reduce((acc, cur) => acc += +cur, 0)
				/ reactors.length
			);

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

ko.applyBindings(ko.mapping.fromJS(new Station()));