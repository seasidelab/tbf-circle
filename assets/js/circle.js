// サークルリスト
var CircleList = (function () {
	var self = function ()
	{
		this.jsonStorage = new JSONStorage(setting.storageKeys.circle);

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

// スター
var StarList = (function () {
	var self = function ()
	{
		this.jsonStorage = new JSONStorage(setting.storageKeys.star);
		this.circleIds = this.jsonStorage.exists() ? this.jsonStorage.get() : {};

		// クリアボタンの取得と状態更新
		this.clearButton = self.dataAttr.find('clear').click(function () {
			this.clear();
		}.bind(this));
		this.updateClearButton();
	};

	self.dataAttr = new DataAttr('star-list');

	self.prototype.size = function ()
	{
		return Object.keys(this.circleIds).length;
	};

	self.prototype.exists = function (circleId)
	{
		return circleId in this.circleIds;
	};

	self.prototype.add = function (circleId)
	{
		this.circleIds[circleId] = circleId;
		this.jsonStorage.set(this.circleIds);
		this.updateClearButton();
	};

	self.prototype.remove = function (circleId)
	{
		delete this.circleIds[circleId];
		this.jsonStorage.set(this.circleIds);
		// 0 件になったら全て削除
		if (this.size() === 0)
		{
			this.clear();
		}
	};

	self.prototype.clear = function ()
	{
		this.circleIds = {};
		this.jsonStorage.clear();
		this.updateClearButton();
	};

	self.prototype.toggle = function (addOrRemove, circleId)
	{
		addOrRemove ? this.add(circleId) : this.remove(circleId);
	};

	self.prototype.updateClearButton = function ()
	{
		this.clearButton.toggle(this.jsonStorage.exists());
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
	var self = function (starList)
	{
		this.tbody = self.dataAttr.find('table').find('tbody');
		this.countElement = self.dataAttr.find('count');
		this.lazyLoad = new LazyLoad();
		this.imageZoom = new ImageZoom();
		this.starList = starList;
	};

	self.COL_NUM_DETAIL = 6;

	self.dataAttr = new DataAttr('circle-list-view');

	self.prototype.add = function (row)
	{
		var tr = $('<tr></tr>');
		this.tbody.append(tr);

		row.forEach(function (column) {
			var td = $('<td></td>');
			Util.isString(column) ? td.text(column) : td.append(column);
			tr.append(td);
		});
	};

	self.prototype.clear = function ()
	{
		this.tbody.empty();
	};

	self.prototype.update = function (count)
	{
		// 表示件数更新
		this.countElement.text(count);
		// 表示内容変更を通知
		this.lazyLoad.notifyRegionChange();
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

	self.prototype.clearStars = function ()
	{
		this.tbody.find('.circle_star input[type="checkbox"]').prop('checked', false);
	};

	self.prototype.load = function (circle)
	{
		// 再ドラッグ時に古いものが残らないよう空にしておく
		this.clear();

		circle.list.forEach(function (data) {
			this.addData(data);
		}.bind(this));

		this.imageZoom.set('.circle_cut');
		this.update(circle.list.length);
	};

	self.prototype.addData = function (data)
	{
		this.add
		(
			[
				this.createCircleStar(data),
				this.createCircleCut(data),
				this.createCircleSpace(data),
				this.createCircleName(data),
				data.penName,
				this.createCircleGenre(data),
				data.genreFreeFormat
			]
		);
	};

	self.prototype.createCircleStar = function (data)
	{
		var label = $('<label></label>').addClass('circle_star');
		var checkbox = $('<input />').attr('type', 'checkbox').prop('checked', this.starList.exists(data.id)).val(data.id).on('change', function (event) {
			var checkbox = $(event.target);
			this.starList.toggle(checkbox.prop('checked'), checkbox.val());
		}.bind(this));
		label.append(checkbox);
		var span = $('<span></span>');
		label.append(span);
		return label;
	};

	self.prototype.createCircleCut = function (data)
	{
		var circleCutImageUrl = ('circleCutImage' in data) ? data.circleCutImage.url : setting.dummyCutImageUrl;
		return this.lazyLoad.createImage(setting.loadingImageUrl, circleCutImageUrl).addClass('circle_cut');
	};

	self.prototype.createCircleSpace = function (data)
	{
		return Util.createExternalLink(TechBookFest.getCircleUrl(data.event.id, data.id))
		.addClass('circle_space')
		.css('background-color', TechBookFest.getCourceColor(data.eventExhibitCourse.id))
		.text(data.spaces.join('/'));
	};

	self.prototype.createCircleName = function (data)
	{
		var name = $('<span></span>').attr('title', data.nameRuby).text(data.name);
		// Web サイトがあればリンクする
		if ('webSiteURL' in data)
		{
			name = Util.createExternalLink(data.webSiteURL).append(name);
		}
		return name;
	};

	self.prototype.createCircleGenre = function (data)
	{
		return $('<span></span>').addClass('circle_genre').text(TechBookFest.resolveGenre(data.genre));
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
		this.starList = new StarList();
		this.circleListView = new CircleListView(this.starList);
		this.circleSearch = new CircleSearch(this.circleListView);

		this.circleList.getClearButton().click(function () {
			this.circleListView.clear();
			this.changeState('begin');
		}.bind(this));

		this.starList.getClearButton().click(function () {
			this.circleListView.clearStars();
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