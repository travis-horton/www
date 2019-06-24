;(function() {
	document.addEventListener("DOMContentLoaded", function() {
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
					{innerText: "About", href:"/index.html"},
					{innerText: "Portfolio", href:"/portfolio/index.html"},
          {innerText: "Blog", href:"/blog/index.html"},
          {innerText: "Contact", href:"/contact.html"}
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
