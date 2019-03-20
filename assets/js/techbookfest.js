var TechBookFest = (function () {
	var self = function ()
	{
	};

	self.NAME = '技術書典';

	self.URL = 'https://techbookfest.org';

	self.GENRES =
	{
		'software': 'ソフトウェア全般',
		'hardware': 'ハードウェア全般',
		'technology': '科学技術',
		'other': 'その他'
	};

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

	self.resolveGenre = function (key)
	{
		return (key in self.GENRES) ? self.GENRES[key] : key;
	};

	return self;
}());