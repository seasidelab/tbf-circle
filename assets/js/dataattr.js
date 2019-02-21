var DataAttr = (function () {
	var self = function (attributeName)
	{
		this.attributeName = 'data-' + attributeName;
	};

	self.prototype.selector = function (value)
	{
		var expression = this.attributeName;
		if (value !== undefined)
		{
			expression += '="' + value + '"';
		}
		return '[' + expression + ']';
	};

	self.prototype.find = function (value)
	{
		return $(this.selector(value));
	};

	return self;
}());