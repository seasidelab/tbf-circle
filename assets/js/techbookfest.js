var TechBookFest = (function () {
	var self = function ()
	{
	};

	self.NAME = '技術書典';

	self.URL = 'https://techbookfest.org';

	self.getName = function (number)
	{
		return self.NAME + number;
	};

	self.getEventId = function (number)
	{
		return 'tbf' + Util.zeroPadding(number, 2);
	};

	self.getJSONUrl = function (number, limit)
	{
		return self.URL + '/api/circle?' + $.param({
			'eventID': self.getEventId(number),
			'visibility': 'site',
			'limit': limit,
			'onlyAdoption': 'true'
		});
	};

	self.getHomeUrl = function (eventId)
	{
		return self.URL + '/event/' + eventId;
	};

	self.getCircleUrl = function (eventId, id)
	{
		return self.getHomeUrl(eventId) + '/circle/' + id;
	};

	return self;
}());