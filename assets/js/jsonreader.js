var JSONReader = (function () {
	let self = function ()
	{
	};

	self.read = function (dataTransfer)
	{
		let deferred = $.Deferred();

		let files = dataTransfer.files;
		if (files.length === 0)
		{
			// ファイル以外
			deferred.reject('file not found');
		}
		else
		{
			let file = files[0];
			if (file.type != 'application/json' && file.name.match(/\.json$/) === null)	// 拡張子による判定は IE 対策
			{
				// JSON 以外
				deferred.reject('invalid file type: ' + file.type);
			}
			else
			{
				let reader = new FileReader();
				reader.onload = function (event)
				{
					try
					{
						let text = event.target.result;
						let object = JSON.parse(text);
						deferred.resolve(object);
					}
					catch (e)
					{
						// "Persistent storage maximum size reached" はスクリプトが停止してしまうので
						// エラーの原因がすぐに分かるよう再 throw しておく
						if (e instanceof DOMException)
						{
							throw e;
						}
						// 不正なフォーマット
						deferred.reject(e.message);
					}
				};
				reader.onerror = function (event)
				{
					let error = event.target.error;
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