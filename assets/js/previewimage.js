var PreviewImage = (function () {
	let self = function (attributeName)
	{
		let dataAttributeName = 'data-' + ((attributeName !== undefined) ? attributeName : self.DEFAULT_ATTRIBUTE_NAME);
		this.srcDataAttributeName = dataAttributeName + '-src';

		this.div = $('<div></div>')
		.attr(dataAttributeName, 'container')
		.css('position', 'fixed')
		.hide();
		$('body').append(this.div);

		this.img = $('<img />')
		.attr(dataAttributeName, 'content')
		.attr('src', self.BLANK_IMAGE_URI)
		.css('position', 'absolute');
		this.div.append(this.img);
	};

	self.DEFAULT_ATTRIBUTE_NAME = 'preview-image';

	self.BLANK_IMAGE_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

	self.prototype.set = function (selector)
	{
		if (selector === undefined)
		{
			selector = '[' + this.srcDataAttributeName + ']';
		}

		$(selector)
		.on('mouseover', function (event) {
			let element = $(event.target);
			let src = this.getImageSrc(element);
			if (src !== null)
			{
				this.show(src);
			}
		}.bind(this))
		.on('mouseout', function () {
			this.hide();
		}.bind(this));
	};

	self.prototype.getImageSrc = function (element)
	{
		let src = element.attr(this.srcDataAttributeName);
		if (src !== undefined)
		{
			// OK: Get from data attribute.
			return src;
		}

		if (element.prop('tagName') === 'IMG')
		{
			// OK: Get from image source.
			return element.attr('src');
		}

		// NG: Not found.
		return null;
	};

	self.prototype.show = function (src)
	{
		this.img.attr('src', src);
		this.div.show();
	};

	self.prototype.hide = function ()
	{
		this.div.hide();
		this.img.attr('src', self.BLANK_IMAGE_URI);
	};

	return self;
}());