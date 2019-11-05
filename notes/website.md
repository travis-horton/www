# website
so… here’s the thing, you can’t remember shit, so i’m going to write it all down for you.

1. your website is at travish.com and you can ssh into that by simply ssh www.travish.com
2. you have to have a service that SERVES your files:
	1. you use caddy ([Caddy User Guide](https://caddyserver.com/docs)) to serve your website. caddy runs as a system operation ([systemd(1) - Linux manual page](http://man7.org/linux/man-pages/man1/systemd.1.html)), so to mess with it you have to do `sudo systemctl ...`
		1. caddy’s config file lives in `/etc/caddy/Caddyfile `
3. deploying an application is very different from serving websites
	1. you need a project manager:
		1. you use pm2 [Overview | PM2 Documentation](https://pm2.io/doc/en/runtime/overview/?utm_source=pm2&utm_medium=website&utm_campaign=rebranding)
		2. right now (190502.1550) you aren’t running any apps, though for a minute you had been running a chat app and thinking about running a wander app
		3. these were/will be different domain paths that you had set up in caddy to redirect to a specific port

ttd for this—create a way to easily deploy new stuff… shouldn’t be that hard.

to get the latest version:
git fetch origin **master**
git reset —hard FETCH_HEAD

psql is set up on here--you have a user th and currently just one table named hit_counter (for the hit_counter php example)
