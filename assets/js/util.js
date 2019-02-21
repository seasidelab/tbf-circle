var Util = (function () {
	var self = function ()
	{
	};

	self.upperCaseFirst = function (string)
	{
		return string.replace(/^./, function (char) {
			return char.toUpperCase();
		});
	};

	self.zeroPadding = function (string, length)
	{
		if ($.type(string) !== 'string')
		{
			string = string.toString();
		}

		if (string.length < length)
		{
			var zero = '';
			for (width = length - string.length; width > 0; width--)
			{
				zero += '0';
			}
			string = zero + string;
		}
		return string;
	};

	self.partialMatch = function (haystack, needle)
	{
		return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
	};

	self.createExternalLink = function (url)
	{
		return $('<a></a>').attr({
			'href': url,
			'target': '_blank',
			'rel': 'noreferrer'
		});
	};

	return self;
}());