class Station {
	constructor() {
		const reactors = [1, 2, 3, 4].map(reactor => {
			return {
				index: ko.observable(reactor),
				power: ko.observable(500),
				auto: ko.observable(true),
				pressure: this._getPressure(500),
				temperature: this._getTemperature(500)
			}
		});

		reactors.forEach(reactor => {
			reactor.pressure = ko.computed(() => this._getPressure(reactor.power()));
			reactor.temperature = ko.computed(() => this._getTemperature(reactor.power()));
		})

		this.reactors = reactors;
		this.common = {
			power: ko.observable(2000),
			pressure: ko.computed(() => {
				return reactors
					.map(reactor => reactor.pressure())
					.reduce((cur, acc) => acc += cur)
					/ reactors.length;
			}),
			temperature: ko.computed(() => {
				return reactors
					.map(reactor => reactor.temperature())
					.reduce((cur, acc) => acc += cur)
					/ reactors.length;
			}),
			fullManual: ko.computed(() =>
				this.reactors.every(reactor => !reactor.auto())
			)
		};

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
		const manualReactors = this.reactors()
			.filter(reactor => !reactor.auto());
		const availableReactors = this.reactors()
			.filter(reactor => reactor.auto());

		let wholePower = this.common.power();
		const manualPower = manualReactors
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0);

		let autoPower = Math.floor((wholePower - manualPower) / availableReactors.length);
		autoPower = autoPower > 1000 ? 1000 : autoPower;
		availableReactors.forEach(reactor => reactor.power(autoPower));

		wholePower = this.reactors()
			.map(reactor => reactor.power())
			.reduce((acc, cur) => acc += +cur, 0);
		this.common.power(wholePower);
	}
}

ko.applyBindings(ko.mapping.fromJS(new Station()));
