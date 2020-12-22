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
				power: ko.observable(reactor.power()),
				pressure: ko.observable(this._getPressure(reactor.power())),
				temperature: ko.observable(this._getTemperature(reactor.power()))
			};
		});
		info.unshift({
			index: ko.observable(0),
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
		setInterval(() => {
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
		}, 1000);
	}
}

ko.applyBindings(ko.mapping.fromJS(new Station()));
