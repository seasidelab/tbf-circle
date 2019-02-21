var JSONStorage = (function () {
	var self = function (key)
	{
		this.key = key;
	};

	self.storage = SafeStorage;

	self.prototype.exists = function ()
	{
		return self.storage.getItem(this.key) !== null;
	};

	self.prototype.get = function ()
	{
		return JSON.parse(self.storage.getItem(this.key));
	};

	self.prototype.set = function (object)
	{
		self.storage.setItem(this.key, JSON.stringify(object));
	};

	self.prototype.clear = function ()
	{
		self.storage.removeItem(this.key);
	};

	return self;
}());