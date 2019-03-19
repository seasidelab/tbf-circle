// サークルリスト
var CircleList = (function () {
	var self = function ()
	{
		this.jsonStorage = new JSONStorage(setting.storageKey);

		// クリアボタンの取得と状態更新
		this.clearButton = self.dataAttr.find('clear').click(function () {
			this.clear();
		}.bind(this));
		this.updateClearButton();

		// ダウンロードリンク追加
		var jsonUrl = TechBookFest.getJSONUrl(setting.number, setting.limit);
		var anchor = Util.createExternalLink(jsonUrl).text(jsonUrl);
		self.dataAttr.find('link').append(anchor);
	};

	self.dataAttr = new DataAttr('circle-list');

	self.prototype.exists = function ()
	{
		return this.jsonStorage.exists();
	};

	self.prototype.get = function ()
	{
		return this.jsonStorage.get();
	};

	self.prototype.set = function (data)
	{
		this.jsonStorage.set(data);
		this.updateClearButton();
	};

	self.prototype.clear = function ()
	{
		this.jsonStorage.clear();
		this.updateClearButton();
	};

	self.prototype.updateClearButton = function ()
	{
		this.clearButton.toggle(this.exists());
	};

	self.prototype.getClearButton = function ()
	{
		return this.clearButton;
	};

	return self;
}());

// 画像拡大表示
var ImageZoom = (function () {
	var self = function ()
	{
		this.element = self.dataAttr.find();
		this.hide();
	};

	self.dataAttr = new DataAttr('image-zoom');

	self.prototype.show = function (srcImage)
	{
		var destImage = $('<img />').attr('src', srcImage.attr('src'));
		this.element.append(destImage).show();
	};

	self.prototype.hide = function ()
	{
		this.element.hide().empty();
	};

	self.prototype.set = function (selector)
	{
		$(selector)
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

// サークルリスト表示
var CircleListView = (function () {
	var self = function ()
	{
		this.tbody = self.dataAttr.find('table').find('tbody');
		this.countElement = self.dataAttr.find('count');
		this.lazyLoad = new LazyLoad();
		this.imageZoom = new ImageZoom();
	};

	self.COL_NUM_DETAIL = 5;

	self.dataAttr = new DataAttr('circle-list-view');

	self.prototype.load = function (circle)
	{
		// 再ドラッグ時に古いものが残らないよう空にしておく
		this.tbody.empty();

		circle.list.forEach(function (data) {
			this.addData(data);
		}.bind(this));

		this.update(circle.list.length);
		this.imageZoom.set('.circle_cut');
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
		return this.lazyLoad.createImage(setting.loadingImageUrl, data.circleCutImage.url).addClass('circle_cut');
	};

	self.prototype.createCircleSpace = function (data)
	{
		return Util.createExternalLink(TechBookFest.getCircleUrl(data.event.id, data.id)).addClass('circle_space').text(data.spaces.join('/'));
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

// サークル検索
var CircleSearch = (function () {
	var self = function (circleListView)
	{
		this.circleListView = circleListView;

		this.input = self.dataAttr.find();
		this.input.on('input', function () {
			this.execute();
		}.bind(this));
	};

	self.dataAttr = new DataAttr('circle-search');

	self.prototype.filter = function (keyword)
	{
		this.circleListView.filter(function (tr) {
			var tds = tr.find('td');
			return Util.partialMatch(tds.eq(CircleListView.COL_NUM_DETAIL).text(), keyword);
		});
	};

	self.prototype.execute = function ()
	{
		this.filter(this.input.val());
	};

	return self;
}());

// メイン処理
var StateController = (function () {
	var self = function ()
	{
		this.circleList = new CircleList();
		this.circleListView = new CircleListView();
		this.circleSearch = new CircleSearch(this.circleListView);

		this.circleList.getClearButton().click(function () {
			this.changeState('begin');
		}.bind(this));
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
		if (this.circleList.exists())
		{
			this.changeState('success', this.circleList.get());
		}
	};

	self.prototype.stateLoading = function (dataTransfer)
	{
		$('html').addClass('loading');	// ロード中カーソル設定
		JSONReader.read(dataTransfer)
		.done(function (circle) {
			this.circleList.set(circle);
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
		this.circleListView.load(circle);
		this.circleSearch.execute();
	};

	self.prototype.stateFailure = function (errorMessage)
	{
		$('#error_message').text(errorMessage);
	};

	return self;
}());