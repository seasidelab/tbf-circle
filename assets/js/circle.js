// サークルリスト
var CircleList = (function () {
	let self = function ()
	{
		this.observable = new Observable(this);

		this.jsonStorage = new JSONStorage(setting.storageKeys.circle);

		// クリアボタンの取得と状態更新
		this.clearButton = self.dataAttr.find('clear').click(function () {
			this.clear();
		}.bind(this));
		this.updateClearButton();

		// ダウンロードリンク追加
		let jsonUrl = TechBookFest.getJSONUrl(setting.number, setting.limit);
		let anchor = Util.createExternalLink(jsonUrl).text(jsonUrl);
		self.dataAttr.find('link').append(anchor);
	};

	self.dataAttr = new DataAttr('circle-list');

	self.prototype.addListener = function (type, listener)
	{
		this.observable.add(type, listener);
	};

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
		this.observable.notify('clear');
	};

	self.prototype.updateClearButton = function ()
	{
		this.clearButton.toggle(this.exists());
	};

	return self;
}());

// スター
var StarList = (function () {
	let self = function ()
	{
		this.observable = new Observable(this);

		this.jsonStorage = new JSONStorage(setting.storageKeys.star);
		this.circleIds = this.jsonStorage.exists() ? this.jsonStorage.get() : {};

		// クリアボタンの取得と状態更新
		this.clearButton = self.dataAttr.find('clear').click(function () {
			this.clear();
		}.bind(this));
		this.updateClearButton();
	};

	self.dataAttr = new DataAttr('star-list');

	self.prototype.addListener = function (type, listener)
	{
		this.observable.add(type, listener);
	};

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
		this.observable.notify('clear');
	};

	self.prototype.toggle = function (circleId, addOrRemove)
	{
		addOrRemove ? this.add(circleId) : this.remove(circleId);
	};

	self.prototype.updateClearButton = function ()
	{
		this.clearButton.toggle(this.jsonStorage.exists());
	};

	return self;
}());

// サークルリスト表示
var CircleListView = (function () {
	let self = function ()
	{
		this.observable = new Observable(this);

		this.tbody = self.dataAttr.find('table').find('tbody');
		this.countElement = self.dataAttr.find('count');
		this.lazyLoad = new LazyLoad();
		this.previewImage = new PreviewImage();
	};

	self.COL_NUM_STAR   = 0;
	self.COL_NUM_DETAIL = 6;

	self.dataAttr = new DataAttr('circle-list-view');

	self.prototype.addListener = function (type, listener)
	{
		this.observable.add(type, listener);
	};

	self.prototype.add = function (row)
	{
		let tr = $('<tr></tr>');
		this.tbody.append(tr);

		row.forEach(function (column) {
			let td = $('<td></td>');
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
		let visibleCount = 0;

		this.tbody.find('tr').each(function () {
			let tr = $(this);
			let showOrHide = callback(tr);
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

	self.prototype.load = function (circle, starList)
	{
		// 再ドラッグ時に古いものが残らないよう空にしておく
		this.clear();

		circle.list.forEach(function (data) {
			this.addData(data, starList);
		}.bind(this));

		this.previewImage.set('.circle_cut');
		this.update(circle.list.length);
	};

	self.prototype.addData = function (data, starList)
	{
		this.add
		(
			[
				this.createCircleStar(data, starList),
				this.createCircleCut(data),
				this.createCircleSpace(data),
				this.createCircleName(data),
				data.penName,
				this.createCircleGenre(data),
				this.createCircleDetail(data)
			]
		);
	};

	self.prototype.createCircleStar = function (data, starList)
	{
		let label = $('<label></label>').addClass('circle_star');
		let checkbox = $('<input />').attr('type', 'checkbox').prop('checked', starList.exists(data.id)).val(data.id).on('change', function (event) {
			let checkbox = $(event.target);
			this.observable.notify('check', checkbox.val(), checkbox.prop('checked'));
		}.bind(this));
		label.append(checkbox);
		let span = $('<span></span>');
		label.append(span);
		return label;
	};

	self.prototype.createCircleCut = function (data)
	{
		let circleCutImageUrl = ('circleCutImage' in data) ? data.circleCutImage.url : setting.dummyCutImageUrl;
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
		let name = $('<span></span>').attr('title', data.nameRuby).text(data.name);
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

	self.prototype.createCircleDetail = function (data)
	{
		let text = data.genreFreeFormat;
		// タグがあれば展開
		if ('tags' in data)
		{
			text += '\n\n' + data.tags.map(function (tag) {
				return '#' + tag;
			}).join(' ');
		}
		return $('<div></div>').addClass('circle_detail').text(text);
	};

	return self;
}());

// サークル検索
var CircleSearch = (function () {
	let self = function ()
	{
		this.observable = new Observable(this);

		let form = self.dataAttr.find();

		this.starCheckbox = form.find('[name="star"]');
		this.starCheckbox.on('change', function () {
			this.execute();
		}.bind(this));

		this.keywordInput = form.find('[name="keyword"]');
		this.keywordInput.on('input', function () {
			this.execute();
		}.bind(this));
	};

	self.dataAttr = new DataAttr('circle-search');

	self.prototype.addListener = function (type, listener)
	{
		this.observable.add(type, listener);
	};

	self.prototype.execute = function ()
	{
		this.observable.notify('change', this.starCheckbox.prop('checked'), this.keywordInput.val());
	};

	return self;
}());

// メイン処理
var StateController = (function () {
	let self = function ()
	{
		this.circleList     = new CircleList();
		this.starList       = new StarList();
		this.circleListView = new CircleListView();
		this.circleSearch   = new CircleSearch();

		this.circleList.addListener('clear', function () {
			// JSON キャッシュが削除されたらリストをクリアして初期状態に戻す
			this.circleListView.clear();
			this.changeState('begin');
		}.bind(this));

		this.starList.addListener('clear', function () {
			// ストレージのスターが削除されたらリストの全スターをオフにする
			this.circleListView.clearStars();
			// 検索対象の状態が変化したので再検索
			this.circleSearch.execute();
		}.bind(this));

		this.circleListView.addListener('check', function (circleId, isChecked) {
			// リストのスターが変更されたらストレージにも反映
			this.starList.toggle(circleId, isChecked);
			// 検索対象の状態が変化したので再検索
			this.circleSearch.execute();
		}.bind(this));

		this.circleSearch.addListener('change', function (isStarChecked, keyword) {
			// 検索条件が変更されたらリストをフィルター
			this.circleListView.filter(function (tr) {
				let tds = tr.find('td');
				if (isStarChecked && !tds.eq(CircleListView.COL_NUM_STAR).find('input').prop('checked'))
				{
					return false;
				}
				if (!Util.partialMatch(tds.eq(CircleListView.COL_NUM_DETAIL).find('.circle_detail').text(), keyword))
				{
					return false;
				}
				return true;
			});
		}.bind(this));
	};

	self.dataAttr = new DataAttr('state');

	self.run = function ()
	{
		let instance = new self();
		instance.initialize();
		instance.changeState('begin');
	};

	self.prototype.changeState = function (stateName)
	{
		// ブロック表示切り替え
		self.dataAttr.find().hide();
		self.dataAttr.find(stateName).show();

		// メソッド名確定
		let methodName = 'state' + Util.upperCaseFirst(stateName);
		// 引数を引き継ぐ
		let args = Array.prototype.slice.call(arguments, 1);
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
		this.circleListView.load(circle, this.starList);
		this.circleSearch.execute();
	};

	self.prototype.stateFailure = function (errorMessage)
	{
		$('#error_message').text(errorMessage);
	};

	return self;
}());