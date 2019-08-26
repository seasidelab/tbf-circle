var SafeStorage = (function () {
	let self = function ()
	{
	};

	self.storage = window.localStorage;

	self.enabled = (self.storage instanceof Storage);

	self.getItem = function (keyName)
	{
		if (!self.enabled) return null;
		return self.storage.getItem(keyName);
	};

	self.setItem = function (keyName, keyValue)
	{
		if (!self.enabled) return;
		self.storage.setItem(keyName, keyValue);
	};

	self.removeItem = function (keyName)
	{
		if (!self.enabled) return;
		self.storage.removeItem(keyName);
	};

	return self;
}());