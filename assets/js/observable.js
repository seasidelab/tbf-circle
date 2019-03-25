var Observable = (function () {
	let self = function (thisArg)
	{
		this.thisArg = thisArg;
		this.listenersByType = {};
	};

	self.prototype.add = function (type, listener)
	{
		if (!(type in this.listenersByType))
		{
			this.listenersByType[type] = [];
		}

		this.listenersByType[type].push(listener);
	};

	self.prototype.notify = function (type)
	{
		if (!(type in this.listenersByType))
		{
			return;
		}
		let listeners = this.listenersByType[type];

		let args = Array.prototype.slice.call(arguments, 1);

		for (let i = 0, length = listeners.length; i < length; ++i)
		{
			listeners[i].apply(this.thisArg, args);
		}
	};

	return self;
}());