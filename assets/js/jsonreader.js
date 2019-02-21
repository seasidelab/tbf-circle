var JSONReader = (function () {
	var self = function ()
	{
	};

	self.read = function (dataTransfer)
	{
		var deferred = $.Deferred();

		var files = dataTransfer.files;
		if (files.length === 0)
		{
			// ファイル以外
			deferred.reject('file not found');
		}
		else
		{
			var file = files[0];
			if (file.type != 'application/json' && file.name.match(/\.json$/) === null)	// 拡張子による判定は IE 対策
			{
				// JSON 以外
				deferred.reject('invalid file type: ' + file.type);
			}
			else
			{
				var reader = new FileReader();
				reader.onload = function (event)
				{
					try
					{
						var text = event.target.result;
						var object = JSON.parse(text);
						deferred.resolve(object);
					}
					catch (e)
					{
						// 不正なフォーマット
						deferred.reject(e.message);
					}
				};
				reader.onerror = function (event)
				{
					var error = event.target.error;
					// その他読み込みエラー
					deferred.reject(error.name + ': ' + error.message);
				};
				reader.readAsText(file);
			}
		}

		return deferred.promise();
	};

	return self;
}());