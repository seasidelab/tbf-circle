var LazyLoad = (function () {
	let self = function (attributeName)
	{
		this.dataAttributeName = 'data-' + ((attributeName !== undefined) ? attributeName : self.DEFAULT_ATTRIBUTE_NAME);
		this.selector = 'img[' + this.dataAttributeName + ']';

		// 読み込み中画像の数
		this.loadingCount = 0;

		this.window = $(window);
		this.window
		.scroll(function () {
			this.notifyRegionChange();
		}.bind(this))
		.resize(function () {
			this.notifyRegionChange();
		}.bind(this));
	};

	self.DEFAULT_ATTRIBUTE_NAME = 'lazyload';

	self.prototype.createImage = function (src, originalSrc)
	{
		return $('<img />').attr('src', src).attr(this.dataAttributeName, originalSrc);
	};

	self.prototype.notifyRegionChange = function ()
	{
		// ウィンドウ範囲
		let windowTop    = this.window.scrollTop();
		let windowBottom = windowTop + this.window.height();

		$(this.selector).each(function (index, element) {
			let img = $(element);
			if (img.is(':hidden'))
			{
				// 非表示要素
				return;
			}

			// 画像範囲
			let imageTop    = img.offset().top;
			let imageBottom = imageTop + img.outerHeight();
			if (imageTop > windowBottom || imageBottom < windowTop)
			{
				// 表示範囲外
				return;
			}

			// 本来の画像に切り替え読み込み開始
			this.loadingCount++;
			img.on('load', function () {
				this.loadingCount--;
				// 画像切り替えでレイアウトが変化する可能性があるので再検出を行う
				// 再検出は重い処理なので一連の画像読み込みが全て完了したタイミングに限定する
				if (this.loadingCount === 0)
				{
					this.notifyRegionChange();
				}
			}.bind(this)).attr('src', img.attr(this.dataAttributeName)).removeAttr(this.dataAttributeName);
		}.bind(this));
	};

	return self;
}());