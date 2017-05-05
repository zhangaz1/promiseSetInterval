if(require) {
	/*let*/
	_ = require('underscore');
}

var scope = {}; // || global || window;

;
(function(scope, name) {
	let defaultOption = {
		predicate: true,
		interval: 1000,
		callback: _.noop,
		continueWhenError: false,
	};

	/*
	 *	setNBInterval
	 *
	 * 使用说明见需求文档
	 *
	 * 返回值为一个cancel函数（类似angular事件订阅的返回）
	 *
	 * >>>几个注意点：<<<
	 * 1. callback 推荐返回promise，如果全是同步操作也可以不返回promise
	 * 2. callback 参数中option是可以修改的(即可以动态调整interval、predicate、甚至callback)
	 * 3. callback或predicate中未处理的异常会终止interval过程，所以应该处理好异常
	 * 4. continueWhenError 若为true则当异常后，继续下一次
	 *
	 */
	scope[name] = interval;

	return void(0);

	function interval(callback, interval, option) { // or interval(option)
		let realOption = prepareRealOption.apply(null, arguments);
		return doInterval(realOption);
	}

	function doInterval(option) {
		let firstRunOn,
			lastRunOn,
			runCounts = 0,
			tryTimes = 0;

		let stopped = false;

		let intervalData = {};
		definedGetters();

		let currentOption;
		let timeoutId;

		setNext();

		return stop;

		// return void(0);

		function setNext() {
			if(stopped) {
				return;
			}

			prepareCurrentOption();
			timeoutId = setTimeout(run, currentOption.interval);
		}

		function run() {
			tryTimes++;
			prepareCurrentOption();

			if(shouldCallback()) {
				doRun();
			} else {
				setNext();
			}
		}

		function shouldCallback() {
			let predicate = currentOption.predicate;
			return _.isFunction(predicate) ?
				predicate() :
				predicate;
		}

		function doRun() {
			Promise.resolve()
				.then(doCallback)
				.then(setNext) /*done、finally*/
				.catch(handleError);
		}

		function doCallback() {
			updateIntervalData();
			return currentOption.callback(intervalData);
		}

		function updateIntervalData() {
			lastRunOn = new Date();

			if(isFirstRun()) {
				firstRunOn = lastRunOn;
			}

			runCounts++;
		}

		function isFirstRun() {
			return runCounts === 0;
		}

		function handleError(err) {
			console.error(err);

			if(currentOption.continueWhenError) {
				setNext();
			} else {
				stopped = true;
			}
		}

		function stop() {
			stopped = true;
			clearTimeout(timeoutId);
		}

		function definedGetters() {
			Object.defineProperty(intervalData, 'firstRunOn', {
				get: () => firstRunOn,
			});
			Object.defineProperty(intervalData, 'lastRunOn', {
				get: () => lastRunOn,
			});
			Object.defineProperty(intervalData, 'runCounts', {
				get: () => runCounts,
			});
			Object.defineProperty(intervalData, 'tryTimes', {
				get: () => tryTimes,
			});
			Object.defineProperty(intervalData, 'stopped', {
				get: () => stopped,
			});
			Object.defineProperty(intervalData, 'option', {
				get: () => option.originalOption,
			});
		}

		function prepareCurrentOption() {
			currentOption = generateCurrentOption(option);
		}
	}

	function generateCurrentOption(option) {
		let currentOption = _.extend({},
			defaultOption, {
				callback: option.callback,
				interval: option.interval,
			},
			option.originalOption
		);

		if(!_.isNumber(currentOption.interval)) {
			throwError('interval must be a number');
		}

		if(!_.isFunction(currentOption.callback)) {
			throwError('callback must be a function');
		}

		return currentOption;
	}

	function prepareRealOption() {
		let realOption = {};

		let args = arguments.length;

		if(args === 1) {
			let param = arguments[0];
			if(_.isFunction(param)) {
				parseCallback(param, realOption);
			} else {
				parseOption(param, realOption);
			}
		} else if(args >= 2) {
			parseCallback(arguments[0], realOption);
			parseInterval(arguments[1], realOption);

			if(args >= 3) {
				parseOption(arguments[2], realOption);
			}
		} else {
			throwInvalidArguments();
		}

		return realOption;
	}

	function parseCallback(callback, realOption) {
		if(!_.isFunction(callback)) {
			throwInvalidArguments();
		}

		realOption.callback = callback;
	}

	function parseInterval(interval, realOption) {
		if(!_.isNumber(interval)) {
			throwInvalidArguments();
		}

		realOption.interval = interval;
	}

	function parseOption(option, realOption) {
		if(!_.isObject(option)) {
			throwInvalidArguments();
		}

		realOption.originalOption = option;
	}

	function throwInvalidArguments() {
		throwError('take a see carefully on the use help');
	}

	function throwError(err) {
		throw new Error(err);
	}

})(scope, 'setNBInterval');

function test() {
	let interval = 1000;
	let option = {
		predicate: () => /*true ||*/ Math.random() > 0.5,
		interval: interval,
		callback: callback,
		continueWhenError: true,
	};

	var cancelInterval;

	// cancelInterval = scope.setNBInterval(); // error
	// cancelInterval = scope.setNBInterval(callback);
	cancelInterval = scope.setNBInterval(option);

	// // cancelInterval = scope.setNBInterval(callback, 'interval'); // error
	// cancelInterval = scope.setNBInterval(callback, interval);
	//
	// // cancelInterval = scope.setNBInterval(callback, interval, 5); // error
	// // cancelInterval = scope.setNBInterval(callback, interval, 'abc'); // error
	// // cancelInterval = scope.setNBInterval(callback, interval, function() {}); // no error
	// cancelInterval = scope.setNBInterval(callback, interval, {});
	//
	// cancelInterval = scope.setNBInterval(callback, interval, option);

	return void(0);

	function callback(intervalData) {
		console.log(
			intervalData.firstRunOn,
			intervalData.lastRunOn,
			intervalData.stopped,
			intervalData.tryTimes,
			intervalData.runCounts
		);

		console.log('run callback');

		if(intervalData.runCounts >= 10) {
			cancelInterval && cancelInterval();
		}

		if(Math.random() > 0.5) {
			throw new Error('test ero'); // error
		}

		// return;

		return new Promise(function(resolve, reject) {
			if(intervalData.runCounts === 1) {
				intervalData.option.interval *= Math.random();
			}
			setTimeout(resolve, Math.random() * 1000); // resolve();
		});
	}
}

test();
