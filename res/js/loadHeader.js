;(function() {
	document.addEventListener("DOMContentLoaded", function() {
    console.log(ROOT);
		function loadHeader() {
				const doc = document
				const body = doc.querySelector('body');

				let header = doc.createElement('header');
				let navList = doc.createElement('ul');
				navList.className = "navList";

				function addNavItem(innerText, href) {
					let listItem = doc.createElement('li');
					let aRef = doc.createElement('a');
					aRef.href = href;
					aRef.innerText = innerText;
					listItem.appendChild(aRef);
					navList.appendChild(listItem);
				}

				let navItems = [
					{innerText: "Code", href:ROOT + "/kiddspazz/index.html"},
					{innerText: "Bio", href:ROOT + "/index.html"},
          {innerText: "Contact", href:ROOT + "/contact.html"}
				]

				for (let i = 0; i < navItems.length; i ++) {
					addNavItem(navItems[i].innerText, navItems[i].href);
				}

				header.appendChild(navList);
				body.prepend(header);
			}

			loadHeader();
		});

})();
