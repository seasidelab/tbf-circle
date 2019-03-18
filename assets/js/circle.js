// サークルデータ関連
var CircleData = (function () {
	var self = function ()
	{
		this.jsonStorage = new JSONStorage(setting.storageKey);

		// ダウンロードリンク追加
		var jsonUrl = TechBookFest.getJSONUrl(setting.number, setting.limit);
		var anchor = Util.createExternalLink(jsonUrl).text(jsonUrl);
		self.dataAttr.find('link').append(anchor);
	};

	self.dataAttr = new DataAttr('circle-data');

	self.prototype.exists = function ()
	{
		return this.jsonStorage.exists();
	};

	self.prototype.get = function ()
	{
		return this.jsonStorage.get();
	};

	self.prototype.load = function (dataTransfer)
	{
		var deferred = $.Deferred();

		JSONReader.read(dataTransfer)
		.done(function (data) {
			this.jsonStorage.set(data);
			deferred.resolve(data);
		}.bind(this))
		.fail(function (errorMessage) {
			deferred.reject(errorMessage);
		}.bind(this));

		return deferred.promise();
	};

	self.prototype.clear = function ()
	{
		this.jsonStorage.clear();
	};

	self.prototype.getClearButton = function ()
	{
		return self.dataAttr.find('clear');
	};

	return self;
}());

// サークルカットズーム表示
var CircleCutZoom = (function () {
	var self = function ()
	{
		this.element = self.dataAttr.find('view');
		this.hide();
	};

	self.dataAttr = new DataAttr('circle-cut-zoom');

	self.prototype.show = function (srcImage)
	{
		var destImage = $('<img />').attr('src', srcImage.attr('src'));
		this.element
		.append(destImage)
		.show();
	};

	self.prototype.hide = function ()
	{
		this.element.hide().empty();
	};

	self.prototype.update = function ()
	{
		self.dataAttr.find('src')
		.mouseover(function (event) {
			var srcImage = $(event.currentTarget);
			this.show(srcImage);
		}.bind(this))
		.mouseout(function () {
			this.hide();
		}.bind(this));
	};

	return self;
}());

// サークルリスト
var CircleList = (function () {
	var self = function ()
	{
		this.tbody = self.dataAttr.find('table').find('tbody');
		this.countElement = self.dataAttr.find('count');
		this.lazyLoad = new LazyLoad();
		this.circleCutZoom = new CircleCutZoom();
	};

	self.COL_NUM_DETAIL = 5;

	self.dataAttr = new DataAttr('circle-list');

	self.prototype.load = function (circle)
	{
		// 再ドラッグ時に古いものが残らないよう空にしておく
		this.tbody.empty();

		circle.list.forEach(function (data) {
			this.addData(data);
		}.bind(this));

		this.update(circle.list.length);
		this.circleCutZoom.update();
	};

	self.prototype.addData = function (data)
	{
		this.addRow
		(
			[
				this.createCircleCut(data),
				this.createCircleSpace(data),
				this.createCircleName(data),
				data.penName,
				data.genre,
				data.genreFreeFormat
			]
		);
	};

	self.prototype.createCircleCut = function (data)
	{
		if (!('circleCutImage' in data))
		{
			// サークルカットなし
			return 'N/A';
		}
		return this.lazyLoad.createImage(setting.loadingImageUrl, data.circleCutImage.url).attr('data-circle-cut-zoom', 'src');
	};

	self.prototype.createCircleSpace = function (data)
	{
		return Util.createExternalLink(TechBookFest.getCircleUrl(data.event.id, data.id)).addClass('space').text(data.spaces.join('/'));
	};

	self.prototype.createCircleName = function (data)
	{
		var name = $('<ruby></ruby>').text(data.name);
		var rt = $('<rt></rt>').text(data.nameRuby);
		name.append(rt);
		// Web サイトがあればリンクする
		if ('webSiteURL' in data)
		{
			name = Util.createExternalLink(data.webSiteURL).append(name);
		}
		return name;
	};

	self.prototype.addRow = function (row)
	{
		var tr = $('<tr></tr>');
		this.tbody.append(tr);

		row.forEach(function (column) {
			var td = $('<td></td>');
			Util.isString(column) ? td.text(column) : td.append(column);
			tr.append(td);
		});
	};

	self.prototype.update = function (count)
	{
		this.countElement.text(count);
		this.lazyLoad.update();
	};

	self.prototype.filter = function (callback)
	{
		var visibleCount = 0;

		this.tbody.find('tr').each(function () {
			var tr = $(this);
			var showOrHide = callback(tr);
			tr.toggle(showOrHide);
			if (showOrHide)
			{
				visibleCount++;
			}
		});

		this.update(visibleCount);
	};

	return self;
}());

// ジャンル詳細検索
var CircleSearch = (function () {
	var self = function (circleList)
	{
		this.circleList = circleList;

		this.input = self.dataAttr.find();
		this.input.on('input', function () {
			this.update();
		}.bind(this));
	};

	self.dataAttr = new DataAttr('circle-search');

	self.prototype.getKeyword = function ()
	{
		return this.input.val();
	};

	self.prototype.filter = function (keyword, colNum)
	{
		this.circleList.filter(function (tr) {
			var td = tr.find('td').eq(colNum);
			return Util.partialMatch(td.text(), keyword);
		});
	};

	self.prototype.update = function ()
	{
		this.filter(this.getKeyword(), CircleList.COL_NUM_DETAIL);
	};

	return self;
}());

// メイン処理
var StateController = (function () {
	var self = function ()
	{
		this.circleData = new CircleData();
		this.circleList = new CircleList();
		this.circleSearch = new CircleSearch(this.circleList);

		var button = this.circleData.getClearButton();
		if (SafeStorage.enabled)
		{
			button.click(function () {
				this.circleData.clear();
				this.changeState('begin');
			}.bind(this));
		}
		else
		{
			button.hide();
		}
	};

	self.dataAttr = new DataAttr('state');

	self.run = function ()
	{
		var instance = new self();
		instance.initialize();
		instance.changeState('begin');
	};

	self.prototype.changeState = function (stateName)
	{
		// ブロック表示切り替え
		self.dataAttr.find().hide();
		self.dataAttr.find(stateName).show();

		// メソッド名確定
		var methodName = 'state' + Util.upperCaseFirst(stateName);
		// 引数を引き継ぐ
		var args = Array.prototype.slice.call(arguments, 1);
		// 状態に応じたメソッドを呼び出し
		this[methodName].apply(this, args);
	};

	self.prototype.initialize = function ()
	{
		// タイトルと見出し
		$('title').text(setting.titleText);
		$('h1').text(setting.titleText);

		// ドロップ設定
		$('html')
		.on('dragover', function (event) {
			event.preventDefault();
		})
		.on('drop', function (event) {
			event.preventDefault();
			this.changeState('loading', event.originalEvent.dataTransfer);
		}.bind(this));
	};

	self.prototype.stateBegin = function ()
	{
		// キャッシュ済みかチェック
		if (this.circleData.exists())
		{
			this.changeState('success', this.circleData.get());
		}
	};

	self.prototype.stateLoading = function (dataTransfer)
	{
		$('html').addClass('loading');	// ロード中カーソル設定
		this.circleData.load(dataTransfer)
		.done(function (circle) {
			this.changeState('success', circle);
		}.bind(this))
		.fail(function (errorMessage) {
			this.changeState('failure', errorMessage);
		}.bind(this))
		.always(function () {
			$('html').removeClass('loading');	// ロード中カーソル解除
		});
	};

	self.prototype.stateSuccess = function (circle)
	{
		this.circleList.load(circle);
		this.circleSearch.update();
	};

	self.prototype.stateFailure = function (errorMessage)
	{
		$('#error_message').text(errorMessage);
	};

	return self;
}());