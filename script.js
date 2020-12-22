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
				index: 1 + index,
				power: reactor.power(),
				pressure: this._getPressure(reactor.power()),
				temperature: this._getTemperature(reactor.power())
			};
		});
		info.unshift({
			index: 0,
			power: 2000,
			pressure: info
				.map(reactor => reactor.pressure)
				.reduce((cur, acc) => acc += +cur, 0)
				/ info.length,
			temperature: info
				.map(reactor => reactor.temperature)
				.reduce((cur, acc) => acc += +cur, 0)
				/ info.length
		});

		this.info = info;
		this.updatePowers = this.updatePowers;
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
}

ko.applyBindings(ko.mapping.fromJS(new Station()));
