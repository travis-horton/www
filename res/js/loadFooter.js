;(function() {
	document.addEventListener("DOMContentLoaded", function() {
		function loadFooter() {
			const doc = document;
			const body = doc.querySelector("body");

			let footer = doc.createElement("footer");
			let copyright = doc.createElement("span");

			copyright.innerText = "\xa9\'18 kiddspazz"
			copyright.className = "footerItem";

			footer.appendChild(copyright);

			let socialMedias = [
				{
					name: "twitter logo",
					link: "https://twitter.com/brightlyopen",
					src: ROOT + "/res/images/twitterLogo.png"
				},
				{
					name: "instagram logo",
					link: "https://www.instagram.com/brightlyopen",
					src: ROOT + "/res/images/instaLogo.png"
				}
			];

			function addSocialMedia(alt, link, src) {
				let a = doc.createElement("a");
				a.className = "no_dec";
				a.href = link;

				let img = doc.createElement("img");
				img.className = "footerItem";
				img.src = src;
				img.alt = alt;

				a.appendChild(img);
				footer.appendChild(a);
			};

			for (let i = 0; i < socialMedias.length; i++) {
				addSocialMedia(socialMedias[i].name, socialMedias[i].link, socialMedias[i].src);
			}

			body.appendChild(footer);
		}

		loadFooter();
	});
})();
