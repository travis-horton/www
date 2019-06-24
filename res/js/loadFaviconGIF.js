;(function() {
	document.addEventListener("DOMContentLoaded", function() {
		function generateFaviconAnimation() {
			const doc = document;
			let head = doc.querySelector('head');

			if (!doc.getElementById('favicon')) {
				let favicon = doc.createElement('link');

				favicon.id = 'favicon';
				favicon.href = '/res/images/favicons/favicon0.png'
				favicon.type = 'image/png';
				favicon.rel = 'icon';

				head.appendChild(favicon);

				function changeFavicon() {(favicon);
					favicon.setAttribute('href', '/res/images/favicons/favicon' + iC + '.png');
					iC >= 7 ? iC = 0 : iC++;
				};

				let iC = 0;
				window.setInterval(changeFavicon, 300);
			}
		};

		generateFaviconAnimation();
	});
})();
