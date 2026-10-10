# travish.com — what changed, in plain words

This is the whole history of my website, www.travish.com, newest first, written for someone who has never seen the code. It starts on 19.0522 with a few hand-built pages and runs through the React rebuild of 21.0328 to today. Every entry is one step that reached the live site: a release (a pull request that brought a batch of finished work from the development copy to the live one), a single pull request, or a day's changes on one topic.

**How to read an entry**
- The heading names the change, links to the full technical detail on GitHub, and says when it landed (YY.MMDD.HHMM, Boise time).
- A bigger entry lists its parts underneath; each part's name links to the exact change that made it.
- **New:** something you can see or use · **Fixed:** a problem that no longer happens · **Behind the scenes:** a real change you can't see · **Try it:** the address to open, only when it still works today.
- "(Later replaced …)" or "(Later removed …)" means that version is gone and says what took its place.

*First draft, 26.0918. Generated from the git history and checked against the live site.*

## October 2026

**www #156: the backend plan, corrected · two out-of-date lines on the site + 10 more** · [PR #156](https://github.com/travis-horton/www/pull/156) · merged 26.1010.0933 · v3.31.0
- **[Login safety rules in the plan](https://github.com/travis-horton/www/commit/3438a91)** · merged 26.1010.0933
  Behind the scenes: the written plan for the future journal login now lists the rules it must meet before it goes online: who can be sent a login email and how often, how long a login link lasts, and how the login is remembered. Nothing on the site changes; the login doesn't exist yet.
- **[The plan's first line](https://github.com/travis-horton/www/commit/10f9e11)** · merged 26.1010.0933
  Fixed: the plan's opening line called the journal server "the active project" while further down it said "not started". It now says planned and not started, a leisure-paced learning project since 26.1001.
- **[Programming goals](https://github.com/travis-horton/www/commit/ae3e7c6)** · merged 26.1010.0933
  Fixed: the Goals list on www.travish.com/programming still named an old Postgres tutorial and other past goals. It now says one current goal: build travish.com's backend in Zig.
- **[Contact page](https://github.com/travis-horton/www/commit/ae3e7c6)** · merged 26.1010.0933
  Fixed: the Contact page no longer prints a phone number that anyone, including spam robots, could copy. Email is the way to get in touch.
- **[Pages load when opened](https://github.com/travis-horton/www/commit/1e72f85)** · merged 26.1010.0933
  Behind the scenes: the /learn courses, the programming demos and the piano page are now downloaded only when someone opens them, so the first page of a visit loads about a third less script. Nothing looks different.
- **[A damaged progress code is skipped](https://github.com/travis-horton/www/commit/c6729bc)** · merged 26.1010.0933
  Fixed: on /learn, pasting a hand-edited "move progress between devices" code could leave the seximal pages broken until the browser's saved data was cleared, or show a best score above 100%. Damaged entries in a code are now skipped and counted, and the pages keep working.
- **[Blog links and picture](https://github.com/travis-horton/www/commit/4c02028)** · merged 26.1010.0933
  Fixed: on the blog, the "pdf" link in The First Blog Post downloaded a useless copy of the site instead of a PDF; it now opens the Nand2Tetris chapter page. Two links to sites that no longer exist were removed, and the AND-gate picture in The D Flip-Flop, pt 1 no longer shows a broken-picture icon beside it.
- **[Phones](https://github.com/travis-horton/www/commit/11092ad)** · merged 26.1010.0933
  Fixed: on a phone, the programming demos (perlin noise, ray tracer, orbitz, asteroids, polygon race) and the first seximal lesson were wider than the screen and scrolled sideways. The demos now shrink to fit, and the lesson's title wraps so the "next" arrow stays on screen.
- **[Page names in the tab](https://github.com/travis-horton/www/commit/c123c0d)** · merged 26.1010.0933
  New: each page now has its own name in the browser tab and in search results, such as "Piano · Travis Horton"; the home page keeps "Travis Horton: one human bean". Each page also tells search engines that its address on www.travish.com is the real one.
- **[Screen readers](https://github.com/travis-horton/www/commit/cec2eeb)** · merged 26.1010.0933
  Fixed: in the /learn drills, a screen reader now says whether an answer was right after Check, and every page now has a main title a screen reader can find. Nothing on the screen looks different.
- **[Compressed files](https://github.com/travis-horton/www/commit/6c142cc)** · merged 26.1010.0933
  Behind the scenes: the site now sends its script, stylesheet, icons and fonts compressed, so a first visit downloads about a third as much; the main script goes from about 362 KB to about 112 KB. The two font kinds are also labelled as fonts now.
- **[/journal is gone for good](https://github.com/travis-horton/www/commit/6c142cc)** · merged 26.1010.0933
  Fixed: www.travish.com/journal, the hidden page removed on 26.0913, still answered like a page, so search engines had no reason to forget it. It now answers "gone", which tells them to drop it.
- **[Files for search engines](https://github.com/travis-horton/www/commit/6c142cc)** · merged 26.1010.0933
  New: the site has a robots.txt saying search engines may read every page, and a sitemap listing the site's pages (www.travish.com/sitemap.xml), so they can find all of them.
- **[a truer note on the site's building blocks](https://github.com/travis-horton/www/pull/154)** · merged 26.1010.0933
  Behind the scenes: the build file's note on its two starting software bundles now says plainly that they pick up safety fixes on their own, that this is on purpose, and how far each can move without anyone changing the file. Nothing about the site changes.
- **[Live only after the test site passes](https://github.com/travis-horton/www/commit/fbec2e6)** · merged 26.1010.0933
  Behind the scenes: a new version of the site is marked ready for www.travish.com only after it has come up healthy on the test site, kiddspazz.com. Before, the real site could start switching to a new version a few seconds before the test site had finished checking it.
- **[A way back](https://github.com/travis-horton/www/commit/fbec2e6)** · merged 26.1010.0933
  New: an earlier release of www.travish.com can be put back with one command, using the exact build the test site ran for it; the README says how. It works for releases from 26.0928 on.
- **[Test site stays out of search results from the first moment](https://github.com/travis-horton/www/commit/fbec2e6)** · merged 26.1010.0933
  Fixed: after the test site's front door is replaced, the first update would have left kiddspazz.com without its "don't list me in search engines" note until the update after it. The note is now written before the site restarts.
- **[Tidier upkeep](https://github.com/travis-horton/www/commit/7a27225)** · merged 26.1010.0933
  Behind the scenes: the automatic update proposals now send a big new version of a build tool on its own instead of bundled with small ones; the check on the server software's version names now also refuses names like "mainline" or "stable" that change by themselves; and two notes in the setup files were corrected to say what they really do.
- **[the clock page's breath hand lands on time](https://github.com/travis-horton/www/pull/148)** · merged 26.1010.0933
  Fixed: on the clock page, in the sketch with the watch and breath drawn as extra hands, the breath hand pointed one mark too far back for a moment at the start of every lull. It now points at the right mark at that instant as well.
- **[the code's layout is checked on every change](https://github.com/travis-horton/www/pull/147)** · merged 26.1010.0933
  Behind the scenes: three files of the /learn pages were re-wrapped to the site's standard code layout, and the automatic checks on every change now confirm that layout too. Nothing on the pages changes.
- **[a check that draft performances stay off the site](https://github.com/travis-horton/www/pull/146)** · merged 26.1010.0933
  Behind the scenes: every build now checks that the Piano page's unpublished performances are not in the files visitors download, and that the published ones are; the build's checks go red if a draft ever slips back in.
- **[History links repaired after the clean-up](https://github.com/travis-horton/www/pull/145)** · merged 26.1010.0933
  Fixed: after the 26.1009 clean-up that removed old private files from the site's history, every link in this history file pointed at a change ID that no longer existed. All 191 links now point at the same changes under their new IDs.
- **[Programming goal now Zig; Contact page tidied](https://github.com/travis-horton/www/pull/144)** · merged 26.1010.0933
  New: the Programming page's goals list says "Learn Zig" instead of "Learn Rust", and the link goes to Zig's own learning page. The Contact page no longer lists Twitter or Instagram, since those accounts aren't used (the footer dropped them on 26.0905).
  Fixed: the Contact page spelled the blog "Julia Evan's"; it now reads "Julia Evans's".

**www #142: a visit log that survives updates** · [PR #142](https://github.com/travis-horton/www/pull/142) · merged 26.1006.1522 · v3.30.3
- **[a visit log that survives updates](https://github.com/travis-horton/www/pull/141)** · merged 26.1006.1522
  Behind the scenes: the server now writes one line per page visit (when, which page, which site it came from, the browser and device) to a log kept on the server itself, so the history no longer disappears each time the site is updated. Pictures, fonts and code files that load with a page are left out, so each line is one real page view. The log is never published on the site.

**www #139: Glyphs show up in the /learn search box · React 19 + 5 more** · [PR #139](https://github.com/travis-horton/www/pull/139) · merged 26.1004.1002 · v3.30.2
- **[Glyphs show up in the /learn search box](https://github.com/travis-horton/www/pull/140)** · merged 26.1004.1002
  Fixed: the example glyph in the /learn search box, and any glyph pasted into it, showed as an empty box; it now draws in the sitelen pona font.
- **[React 19](https://github.com/travis-horton/www/pull/137)** · merged 26.1004.1002
  Behind the scenes: the library the whole website is built on moved up a major version (18 to 19). Every page draws the same content as before.
  Fixed: the AND-gate picture on the blog post "The D Flip-Flop, pt 1" has no small placeholder version. It used to give the browser an empty picture address, which the new version warns could make a browser download the whole page again. Now it gives no address at all.
- **[Babel 8 for the site's tests](https://github.com/travis-horton/www/pull/136)** · merged 26.1004.1002
  Behind the scenes: the tool the automatic tests use to read the site's code moved up a major version (7 to 8), with all of its pieces upgraded together. The built website is byte-for-byte the same as before.
- **[A small security fix in the build tools](https://github.com/travis-horton/www/pull/138)** · merged 26.1004.1002
  Behind the scenes: a helper library the build uses got a security patch (brace-expansion 1.1.18 to 1.1.21). Nothing on the site looks or works differently.
- **[Bump the actions group with 2 updates](https://github.com/travis-horton/www/pull/129)** · merged 26.1004.1002
  Behind the scenes: an automatic dependency update — "Bump the actions group with 2 updates".
- **[Bump @testing-library/jest-dom from 6.9.1 to 7.0.1](https://github.com/travis-horton/www/pull/131)** · merged 26.1004.1002
  Behind the scenes: an automatic dependency update — "Bump @testing-library/jest-dom from 6.9.1 to 7.0.1".
- **[Bump the npm-minor-and-patch group across 1 directory with 9 updates](https://github.com/travis-horton/www/pull/135)** · merged 26.1004.1002
  Behind the scenes: an automatic dependency update — "Bump the npm-minor-and-patch group across 1 directory with 9 updates".

**www #127: site upkeep: narrow windows, a seximal hint, toki pona review, clock ballot wording, the new site right after an update, a lighter clock page, checks that run on every pull request, a build from named versions, safety instructions for browsers, a named proxy, old files gone · the three demo projects are pinned to their official versions · Piano page sends only what it shows** · [PR #127](https://github.com/travis-horton/www/pull/127) · merged 26.1003.1238 · v3.30.1
- **[Narrow windows](https://github.com/travis-horton/www/commit/4a51d95)** · merged 26.1003.1238
  Fixed: in a browser window between 501 and 599 pixels wide, every page was wider than the window, so it scrolled sideways and the ends of the lines were cut off. The text now wraps inside the window. Nothing changes on a phone or in a window 600 pixels or wider, except that a browser which always shows its scroll bar had the same problem up to 614 pixels, and that is fixed too.
  Try it: once this is on the site, open https://www.travish.com and drag the browser window as narrow as it will go.
- **[Seximal hint](https://github.com/travis-horton/www/commit/73b1e9c)** · merged 26.1003.1238
  Fixed: in Level 5 of the seximal course, the hint under every "nif minus" question gave one rule, and that rule gives a wrong answer when the number ends in zero: for nif − 20 it leads to "36", and the answer is 40. Those five questions now show the rule the lesson itself gives for that case: nif − X0 = (six−X)0.
- **[Toki pona review remembers the lessons](https://github.com/travis-horton/www/commit/060badd)** · merged 26.1003.1238
  Fixed: toki pona review asks more often about the words you have been getting wrong, but it only counted words missed during review itself. A word missed in the lesson that teaches it now counts too, so it comes back sooner in review. Progress already saved in a browser is untouched.
- **[Clock ballot wording](https://github.com/travis-horton/www/commit/ce38119)** · merged 26.1003.1238
  Fixed: on the clock page, the first face on the ballot was described as "the face at the top of this page", but the big clock came off the top of that page on 26.0905. It now reads "the incumbent: the face this page used to open with".
  Try it: once this is on the site, open https://www.travish.com/programming/clock and scroll down to the first option, "Three hands on a nif-mark dial".
- **[A lighter clock page](https://github.com/travis-horton/www/commit/0674f2a)** · merged 26.1003.1238
  Fixed: to keep its clock hands moving, the clock page was rebuilding everything on it, the text and all five ballot panels included, about 60 times a second. Now only the four clock faces are redrawn that often, [the marks and labels around each dial are drawn once](https://github.com/travis-horton/www/commit/9d6fee6), and the rest of the page is redrawn when the digits change, every 1.85 seconds. The page looks and moves exactly as before; left open, it keeps the browser about a quarter less busy than it did (measured on a laptop, not on a tablet).
- **[The new site right after an update](https://github.com/travis-horton/www/commit/c330d6d)** · merged 26.1003.1238
  Fixed: after the site was updated, a returning visitor's browser could keep its saved copy of the old page, ask for a file the update had replaced, be handed the home page in its place, and show a blank page until a hard reload. The site now tells browsers to check for a newer page on every visit and to keep everything else for a year, and it answers "not found" for a file that is gone.
- **[Page tests that check something](https://github.com/travis-horton/www/commit/b29771e)** · merged 26.1003.1238
  Behind the scenes: the automatic tests for the home, contact, piano, blog, programming and "page not found" pages only checked that each page opened without an error. Each now checks that the page shows what it should: its heading, its links, and that the photo and the resume point at real files. A new test also opens the whole site in React's strictest checking mode and fails if React reports any problem at all.
- **[Asteroids tests run again](https://github.com/travis-horton/www/commit/4c2aed0)** · merged 26.1003.1238
  Behind the scenes: the Asteroids game's own three tests had been switched off in the site's test run. They are back on, and they pass.
- **[Test stand-ins for pictures and files](https://github.com/travis-horton/www/commit/2db7e54)** · merged 26.1003.1238
  Behind the scenes: a picture, font or PDF can be brought into a page in a way that looks fine in the tests but arrives broken on the real site. The tests now treat every such file the way the real site build does, so that mistake turns a test red instead of slipping through. A [follow-up note](https://github.com/travis-horton/www/commit/4e08bea) in the stand-in says it covers PDFs and fonts as well as pictures.
- **[Old files removed](https://github.com/travis-horton/www/commit/4937f45)** · merged 26.1003.1238
  Behind the scenes: four leftover files that no page used were deleted: the three copies of the blog posts from before the site was rebuilt, and an empty placeholder for a roguelike game. What a visitor's browser receives is identical before and after, file for file.
- **[Leftover counter removed](https://github.com/travis-horton/www/commit/037b2e8)** · merged 26.1003.1238
  Behind the scenes: the toki pona drill kept a count of how many times it had been restarted, and nothing ever read it. The count is gone; the drill behaves exactly as before.
- **[Sharper course tests](https://github.com/travis-horton/www/commit/74f3042)** · merged 26.1003.1238
  Behind the scenes: three more automatic checks on the two courses. One confirms that a toki pona lesson writes down only the words you got wrong, not every word it asked. [Another](https://github.com/travis-horton/www/commit/f7eac18) confirms that starting a toki pona drill again deals a new set of questions, and [a third](https://github.com/travis-horton/www/commit/7ab3c28) holds the two seximal "nif minus" hints to their exact wording.
- **[Sharper clock tests](https://github.com/travis-horton/www/commit/aa2f78d)** · merged 26.1003.1238
  Behind the scenes: three more automatic checks on the clock page. One confirms the clock hands are redrawn on every screen refresh, not every other one. One confirms the faces are driven by the browser's own screen-refresh signal, which stops while the tab is hidden, and not by a timer, which would keep running. One confirms the row of seven digits under the seven-hand face keeps time with its hands.
- **[Checks on every pull request](https://github.com/travis-horton/www/commit/d568c53)** · merged 26.1003.1238
  Behind the scenes: the site's tests, its code checker and a trial build used to run only when someone remembered to run them on a laptop. GitHub now runs all three on every pull request and on every change to the sandbox branch, and shows the result beside it. It reports; it does not yet stop a merge.
- **[The real site, started and questioned before a merge](https://github.com/travis-horton/www/commit/983c872)** · merged 26.1003.1238
  Behind the scenes: every pull request now also builds the same package the servers run, starts it, and asks it what the live site is asked: does the home page answer, does an unknown address get the app, does travish.com send you on to www.travish.com with the rest of the address intact, and does the calendar doorbell stay shut without its key and open with it. Until now the first test of that package was the sandbox itself going down. A third check reads the deploy instructions themselves for mistakes.
- **[The footer's version, without the baggage](https://github.com/travis-horton/www/commit/9e6ec43)** · merged 26.1003.1238
  Behind the scenes: to show its version number, the footer was pulling the site's whole list of building tools and settings into the file every visitor downloads. It now takes just the number. The footer reads exactly as before, the download is about 2 kilobytes smaller, and a check fails if the list ever comes back or if the number goes missing.
- **[Named versions of node and nginx](https://github.com/travis-horton/www/commit/a9b5ed5)** · merged 26.1003.1238
  Behind the scenes: the site was built with "the newest" version of its two base tools, so the same instructions could build a different site from one month to the next with nothing recording when. It is now built from named versions, the very ones "newest" means today, so nothing changes now and a future upgrade is one visible line.
- **[Deploys from fixed code, with a read-only pass](https://github.com/travis-horton/www/commit/72be814)** · merged 26.1003.1238
  Behind the scenes: the steps that put the site on its servers borrow five tools from other people, named by a label their owners could later move to different code. Each is now fixed to the exact code that label means today. Both deploys also run with a GitHub pass that can only read this repository, where before it could write to it, and production's deploy can be given a server key of its own.
- **[Version bumps arrive as pull requests](https://github.com/travis-horton/www/commit/29816f6)** · merged 26.1003.1238
  Behind the scenes: with everything held at exact versions, GitHub's Dependabot now checks once a week for newer ones and proposes each as a pull request against the sandbox branch, where the new checks test it.
- **[README and package details brought up to date](https://github.com/travis-horton/www/commit/35c6ef5)** · merged 26.1003.1238
  Behind the scenes: the README's status badges pointed at the repository's old address, its instruction for starting the site locally named a command that does not exist, and it still said "TODO write tests" beside 33 files of them. All three are corrected, and the one-line "rebuild" command no longer needs a Docker tool that Docker stopped shipping.
- **[Three safety instructions for the browser](https://github.com/travis-horton/www/commit/909e8a1)** · merged 26.1003.1238
  Behind the scenes: every answer from the site now tells the browser three things: never guess what kind of file this is, tell other sites only this site's name when a link is followed and not which page, and do not let another website show these pages inside a frame of its own.
- **[Named versions of the proxy](https://github.com/travis-horton/www/commit/dfa3607)** · merged 26.1003.1238
  Behind the scenes: two helper programs stand in front of the site on each server, one passing visitors on to it and one renewing its certificates, and both were named as "the newest", so nothing recorded which version a server ran. The repository now names an exact version of each, and its [setup notes](https://github.com/travis-horton/www/commit/ad0aab4) start them so that they come back after a server restart. The servers themselves change only when the steps in this pull request are run on them by hand.
- **[The newer proxy, tried before it is installed](https://github.com/travis-horton/www/commit/a5763fb)** · merged 26.1003.1238
  Behind the scenes: every pull request now also starts that newer proxy with the site behind it and checks that visitors reach the site, that travish.com still sends you on to www.travish.com, and that the sandbox's "do not index this" marking still works. It cannot try certificates.
- **[More questions for the real site before a merge](https://github.com/travis-horton/www/commit/7176da9)** · merged 26.1003.1238
  Behind the scenes: the check that starts the real site before a merge now asks it 82 questions where it asked 25: what it tells browsers to keep, what it answers for a file that is gone, whether the three safety instructions are on every kind of answer, and whether a real browser can still open the page. A [second check](https://github.com/travis-horton/www/commit/909e8a1) reads the server's settings for the mistakes that would silently drop one of those instructions.
- **[the three demo projects are pinned to their official versions](https://github.com/travis-horton/www/pull/124)** · merged 26.1003.1238
  Behind the scenes: the site keeps a pointer to an exact version of each programming demo. For perlin noise, orbitz and polygon race, that pointer sat on the last step of a fix branch; now that those fixes are merged, it points at each project's main line (v3.2.3, v1.1.3 and v1.0.5). Nothing on the Programming page looks or behaves differently.
- **[Piano page sends only what it shows](https://github.com/travis-horton/www/pull/126)** · merged 26.1003.1238
  Fixed: the Piano page used to send every visitor some private material it never displayed. Private material was removed, and the page looks exactly the same as before.
  Behind the scenes: an automatic check now fails if anything but public performances gets back into the page's data. It also fails if the data gains any kind of detail the page doesn't show, such as names of the other performers, until the page is changed to show it.

## September 2026

**www #123: toki pona: "love" is right for olin · the programming projects are really tested + 8 more** · [PR #123](https://github.com/travis-horton/www/pull/123) · merged 26.0927.2017 · v3.30.0
- **[toki pona: "love" is right for olin](https://github.com/travis-horton/www/pull/120)** · merged 26.0927.2017
  Fixed: on the 21 toki pona word cards whose meaning is a verb written with "to" (olin "to love", lape "to sleep", sona "to know"), typing just the verb was marked wrong. Both "love" and "to love" are right now, in the level drills and in review.
- **[the programming projects are really tested](https://github.com/travis-horton/www/pull/122)** · merged 26.0927.2017
  Behind the scenes: the automatic tests for the Programming page used stand-ins for every project, because one of them, the seximal clock, stopped the test tool with a "duplicate name" error. The clock is fixed, so the tests now load the real projects and check that the seximal time-keeping page draws its hexagon clock.
- **[programming demos stop when you leave them](https://github.com/travis-horton/www/pull/121)** · merged 26.0927.2017
  Fixed: after you visited the perlin noise, orbitz, polygon race or Asteroids demo in the Programming section, it kept drawing out of sight after you moved to another page, and every visit added one more; after three rounds of all four, the browser was drawing 540 hidden frames a second. After visiting Asteroids, pressing R on any page also restarted the hidden game. Leaving a demo's page now stops it completely.
  Try it: once this is on the site, open https://www.travish.com/programming/asteroids, then click Software Engineer at the top and press R: nothing happens.
- **[Typing the question back](https://github.com/travis-horton/www/commit/feaa5f5)** · merged 26.0927.2017
  Fixed: on the base-six "write the base-six numeral" cards, which show a number's spoken name, typing that same name back was marked right. Only the digits count now. And the complement question buried inside a Level 5 chain now shows two digits (nif − 04₆), the same as the plain complement question.
- **["Read the lesson again"](https://github.com/travis-horton/www/commit/695ce62)** · merged 26.0927.2017
  Fixed: after finishing a drill, choosing "read the lesson again" and then Start reopened the finished drill on its last question, and saved a score with one answer too many (13 out of a dozen). It now starts a fresh drill after the lesson, in both courses.
- **[Search labels](https://github.com/travis-horton/www/commit/3d8d749)** · merged 26.0927.2017
  Fixed: searching a toki pona word listed a level that only mentions it in passing as "used here". It now says "mentioned here", the same as the base-six search already did.
- **[Search crash](https://github.com/travis-horton/www/commit/512f039)** · merged 26.0927.2017
  Fixed: typing a few particular words into the search box on /learn (for example "constructor") made the whole site go blank until you reloaded. Those words now simply find nothing.
- **[Safety net for broken pages](https://github.com/travis-horton/www/commit/b1f1119)** · merged 26.0927.2017
  New: if a page ever fails while it is drawing, you now see "Something went wrong on this page" with a reload link and a link home, and the menu and footer stay put. Before, the whole site went white.
- **[Test runs](https://github.com/travis-horton/www/commit/d463e3e)** · merged 26.0927.2017
  Behind the scenes: running the site's tests on the laptop no longer also runs the old copies left behind by Claude's working folders, so a pass or fail now describes the site itself.
- **[Screen readers](https://github.com/travis-horton/www/commit/20f902e)** · merged 26.0927.2017
  Fixed: a screen reader could not tell which menu item was the page you were on (it was shown only by a coloured border), and it read the home-page photo's description twice. It now announces the current page and reads the photo once.
- **[a publish fails when the site isn't running](https://github.com/travis-horton/www/pull/117)** · merged 26.0927.2017
  Fixed: a publish to kiddspazz.com or www.travish.com could be marked successful while the site was down, because only its last step was checked. Now, a few seconds after starting the new site, the publish checks that both parts (travish.com and www.travish.com, and the same pair on the sandbox) are running the version it just installed and haven't crashed and restarted. If either fails that, the publish is marked failed and old builds are not cleaned up.
- **[sandbox publishing tools updated](https://github.com/travis-horton/www/pull/116)** · merged 26.0927.2017
  Behind the scenes: the three Docker tools the sandbox publish uses (build setup, sign-in to the image store, build-and-upload) were moved from versions that ran on software GitHub has retired to their current versions. What gets built and published is unchanged.
- **[old website builds are cleaned off the servers automatically](https://github.com/travis-horton/www/pull/115)** · merged 26.0927.2017
  Behind the scenes: after each successful publish to kiddspazz.com or www.travish.com, the server now deletes stored website builds that no running part of the site uses and that were built more than a week ago. It runs only after the new site is confirmed running, and a failed cleanup never marks a publish as failed. Older builds can still be fetched again from the image store when a rollback needs one.
- **[the live site runs exactly what the practice site tested](https://github.com/travis-horton/www/pull/114)** · merged 26.0927.2017
  Behind the scenes: every build on the practice site is now labelled with a fingerprint of its exact files. Publishing to www.travish.com looks up the build with the same fingerprint and runs that one, waiting up to 15 minutes for it; before, it ran whichever build the practice site had made last. If the matching build never appears, or the server can't download it, nothing is published and the site stays as it was.
- **[the website comes back by itself after a server restart](https://github.com/travis-horton/www/pull/113)** · merged 26.0927.2017
  Fixed: when the server that runs the website restarted, the website went down and stayed down until someone published a new change. Now it starts itself again as soon as the server is back, on both www.travish.com and the practice site.

**www #112: a dead link on the Contact page, and a plan that no longer matched the site · seximal search says where a word is drilled** · [PR #112](https://github.com/travis-horton/www/pull/112) · merged 26.0921.0914 · v3.29.0
- **[The Contact page's Projects link](https://github.com/travis-horton/www/commit/9c43438)** · merged 26.0921.0914
  Fixed: the Github link under "Projects" on your Contact page led to a page that no longer exists, so anyone who clicked it got GitHub's "not found" screen. It now goes to your GitHub account.
  Try it: open https://www.travish.com/contact and click the Github link under "Projects"
- **[The written plan for putting your journal on the site](https://github.com/travis-horton/www/commit/be0a8b4)** · merged 26.0921.0914
  Fixed: the plan described a journal page that was never actually built, said your entries were already loaded into the website when they are not, and counted 2,918 daily entries when there are 3,141. Two of its check-your-work steps told you to expect 2,918, so following them would have made a correct run look like a failure.
  Behind the scenes: those steps now tell you to count the entry files fresh and compare against that, instead of trusting a number written down months ago that grows by one every day.
- **[seximal search says where a word is drilled](https://github.com/travis-horton/www/pull/110)** · merged 26.0921.0914
  New: on the seximal course, a search result now has a second line for the levels that actually drill the word, under the line saying where it is taught. Look up "nif" and it tells you Levels 3 and 4 drill it too, though neither lesson summary mentions it; look up "dozen" and it says "drilled in every level", because that is true of ten of the twelve number words and five links would say it worse.
  Try it: open https://www.travish.com/learn/seximal and type dozen, then nif, then unexian, into the search box.

**www #109: history's Try it lines follow the move to ~/code** · [PR #109](https://github.com/travis-horton/www/pull/109) · merged 26.0919.1332 · v3.28.1
- **[history's Try it lines follow the move to ~/code](https://github.com/travis-horton/www/pull/108)** · merged 26.0919.1332
  Fixed: three "Try it" commands in the site's history (running the checks, running the tests twice) said `cd ~/dev/www`, a folder that was renamed to `~/code` on 26.0919. They now paste and run as written.
  Try it: open Terminal and paste
      cd ~/code/www && npm test

**www #107: the footer shows the true version and when it was built · version numbers from the history** · [PR #107](https://github.com/travis-horton/www/pull/107) · merged 26.0918.1604 · v3.28.0
- **[the footer shows the true version and when it was built](https://github.com/travis-horton/www/pull/106)** · merged 26.0918.1604
  New: the version at the bottom of every page now shows the site's real version followed by the date and time it was built, like v3.28.0+26.0918.1600. It's decided when the sandbox builds, so the live site, running that same build, shows the right number from the moment it goes live. Before it read v2.2.1 plus a commit code, and that number hadn't moved since 26.0309.
  Try it: open https://kiddspazz.com and look at the bottom of the page.
  New: a pull request into the live branch now gets a red X unless it comes from the development branch, so nothing reaches the live site without passing through the sandbox first.
- **[version numbers from the history](https://github.com/travis-horton/www/pull/105)** · merged 26.0918.1604
  New: every entry in this history now shows its version, worked out from what it changed: something removed or broken → a new first number, something new → a new middle number, anything else → a new last number. The hand-built years count as early development (version 0.x) until 20.1216, so 20.1216 is v1.0.0 and the React rebuild of 21.0328 is v2.0.0, exactly where your own old tags put them, and the site is at v3.27.0 today.
  Try it: open https://github.com/travis-horton/www/blob/main/HISTORY.md

**www #104: the development copy keeps up with the live one · the history now updates itself** · [PR #104](https://github.com/travis-horton/www/pull/104) · merged 26.0918.1513 · v3.27.0
- **[the development copy keeps up with the live one](https://github.com/travis-horton/www/pull/103)** · merged 26.0918.1513
  Behind the scenes: after each release, GitHub now moves the development branch up to match the live branch, so it no longer shows as dozens of commits "behind". If the development branch already has new work waiting, it's left untouched, and nothing redeploys.
- **[the history now updates itself](https://github.com/travis-horton/www/pull/102)** · merged 26.0918.1513
  New: every change now carries its own plain-language note, and when changes go live, GitHub collects the notes into one entry at the top of this file, with the time it went live. Automatic library updates get a standard line of their own.
  Try it: open https://github.com/travis-horton/www/blob/main/HISTORY.md

**www #101: this history** · [PR #101](https://github.com/travis-horton/www/pull/101) · merged 26.0918.1414 · v3.26.0
- **[this history](https://github.com/travis-horton/www/pull/100)** · merged 26.0918.1414
  New: this file — seven years of the website in plain words, from its first hand-built pages on 19.0522 to today, newest first, each entry saying what changed on the site and, where it still exists, the address to go see it.

**www #99: /learn content fixes** · [PR #99](https://github.com/travis-horton/www/pull/99) · merged 26.0918.1034 · v3.25.0
- **[lukin comes back in Level 4](https://github.com/travis-horton/www/commit/792dedd)** · merged 26.0918.1023
  New: Level 4 of the toki pona course now brings back lukin from Level 2 in its new sense "to try", on a card marked "again — from Level 2". Every Level 4 session is now 28 items instead of 27, and searching /learn for "try" now finds it.
  Try it: open https://www.travish.com/learn/toki-pona/4
- **[Two-digit "nif minus" questions](https://github.com/travis-horton/www/commit/c210ef9)** · merged 26.0918.1023
  Fixed: in seximal Level 5, the "nif minus" questions sometimes showed a one-digit number (nif − 4₆), even though the rule says to read two digits. They now always show two (nif − 04₆).
  Try it: open https://www.travish.com/learn/seximal/5
- **[A worked multiplication in Lesson Four](https://github.com/travis-horton/www/commit/1e08c4b)** · merged 26.0918.1023
  New: seximal Lesson Four now works one two-digit multiplication by hand (23 × 4, carrying at six, answer 140). Its drill asks for exactly that, and the lesson had never shown one.
  Try it: open https://www.travish.com/learn/seximal/4
- **[The 13132 example in Lesson Two](https://github.com/travis-horton/www/commit/e465e18)** · merged 26.0918.1023
  New: seximal Lesson Two now reads the number 13132 aloud as an example: "one unexian, thirsy-one nif thirsy-two". It shows that the top digit is its own block, followed by the usual pair-nif-pair.
  Try it: open https://www.travish.com/learn/seximal/2
- **["an unexian"](https://github.com/travis-horton/www/commit/6d67630)** · merged 26.0918.1023
  Fixed: Lesson Two said "a unexian". It now says "an unexian".
- **[Answers without the parentheses](https://github.com/travis-horton/www/commit/0934800)** · merged 26.0918.1023
  Fixed: six toki pona word cards (mu, la, pi, a, en and luka) have meanings with words in parentheses, and typing the meaning without the parentheses was marked wrong. The plain answer now counts.
- **[No empty glyph space](https://github.com/travis-horton/www/commit/b89f8a3)** · merged 26.0918.1023
  Fixed: on toki pona Levels 3, 4, 5, 7 and 10, the drill page showed an empty space above the new grammar rule where a sitelen pona glyph would go. Those rules aren't single words and have no glyph, so the empty space is gone.
- **[The course's size, stated one way](https://github.com/travis-horton/www/commit/7cba557)** · merged 26.0918.1023
  Fixed: the toki pona home page gave the size of the course three different ways that didn't agree. Now all three agree: 119 word cards plus li and e (taught as rules), twelve new words a level with eleven in the last one, and "the 120 words of pu, plus kin".
  Try it: open https://www.travish.com/learn/toki-pona
- **[tan seme? in Level 7](https://github.com/travis-horton/www/commit/a726dd3)** · merged 26.0918.1023
  New: Level 7's grammar rule now teaches tan seme? "why?" (mi pali tan seme?). Level 5 had promised this question would come later, and it never did.
  Try it: open https://www.travish.com/learn/toki-pona/7
- **[A new decode sentence for Level 4](https://github.com/travis-horton/www/commit/d42a4ce)** · merged 26.0918.1023
  Fixed: Level 4's sentence to decode just repeated its first prompt. It's now a sentence of its own: ona li sona toki, "she knows how to speak".
- **[No "very" in Level 1](https://github.com/travis-horton/www/commit/f44498f)** · merged 26.0918.1023
  Fixed: Level 1 translated pona suli as "very good", but "very" is the job of mute, which isn't taught until Level 3. It now reads "food is greatly good — a big good", and the closing note says "very" arrives in Level 3.
  Try it: open https://www.travish.com/learn/toki-pona/1

**www #97: travish.com forwards to www.travish.com** · [PR #97](https://github.com/travis-horton/www/pull/97) · merged 26.0917.1114 · v3.24.0
- New: typing travish.com without the "www" now takes you to the same page on www.travish.com, which is now the site's one official address. Before, both addresses served the site separately, and Google flagged the pages as duplicates.
  Try it: open https://travish.com/piano and you land on https://www.travish.com/piano

**www #95: /learn progress transfer and self-checking answers** · [PR #95](https://github.com/travis-horton/www/pull/95) · merged 26.0917.1050 · v3.23.0
- **[Tidy-up](https://github.com/travis-horton/www/commit/725278b)** · merged 26.0917.1046
  Behind the scenes: the two features below were written on 26.0829 and only published now. On the way in they went through the new code formatter, and one out-of-date note telling the code checker to skip a line was removed.
- **[Answers checked for you, and misses by rule](https://github.com/travis-horton/www/commit/de62d2e)** · merged 26.0917.1046
  New: when a toki pona drill asks you to put English into toki pona, the site now checks your answer against every correct version for 29 of the 30 sentences. The one where taso can go in several places is still yours to mark. The end screen lists your misses by the grammar rule they test (for example "no e after a preposition — 3"), and keeps a weak list across your recent sessions.
  Try it: open https://www.travish.com/learn/toki-pona/1
- **[Move progress between devices](https://github.com/travis-horton/www/commit/1eea1cb)** · merged 26.0917.1046
  New: your /learn scores live only in the browser you practiced in, so the iPad and the laptop each kept their own. A "Move progress between devices" button now gives you a code to copy on one device and paste on the other. Pasting only ever adds sessions, never removes them, and it tells you how many it will add before you press the button. (The same commit also gave luka a card to drill, but that had already been done another way, so it added nothing new.)
  Try it: open https://www.travish.com/learn and press "Move progress between devices"

**www #93: code checking, the DEV badge, and a real page title** · [PR #93](https://github.com/travis-horton/www/pull/93) · merged 26.0917.1035 · v3.22.0
- **[The badge becomes a tab](https://github.com/travis-horton/www/commit/2a8567a)** · merged 26.0917.1032
  New: the DEV marker on the dev copy of the site is now a small carmine tab hanging off the left edge, sitting on the line just under the header. A second line shows the full address. The live site shows nothing.
  Try it: open https://kiddspazz.com (compare https://www.travish.com, which has no tab)
- **[DEV and LOCAL badge](https://github.com/travis-horton/www/pull/91)** · merged 26.0917.1023
  New: the dev copy of the site (kiddspazz.com) now carries a "DEV" label, so a browser tab open on it can't be mistaken for the live site. When you run the site on your own computer the label says "LOCAL" instead. That morning it went from a small pill, to a corner ribbon, to a bigger carmine band. (Later replaced on 26.0917 by the tab above.)
- **[Dev site hidden from search engines](https://github.com/travis-horton/www/commit/70f2100)** · merged 26.0917.1023
  New: kiddspazz.com now tells search engines not to list it. Google had been treating it as a duplicate of your real site.
  Try it: open Terminal and paste the line below. It should print "x-robots-tag: noindex, nofollow".
      curl -sI https://kiddspazz.com | grep -i x-robots-tag
- **[A real page title](https://github.com/travis-horton/www/commit/70f2100)** · merged 26.0917.1023
  New: browser tabs and search results now show the title "Travis Horton: one human bean" and the description "Personal website of Travis Horton". Before, they showed the old placeholders "thor" and "kiddspazz".
  Try it: open https://www.travish.com and look at the tab's title
- **[Code-checking rules](https://github.com/travis-horton/www/pull/90)** · merged 26.0917.1010
  Behind the scenes: the automatic code-checking rules were replaced with a newer set that flags only likely bugs, not matters of taste. Your editor had been painting perfectly good code red. A formatter now handles code layout, and every file was reformatted once, with no change to what the site shows.
  Try it: open Terminal and paste
      cd ~/code/www && npm run lint

**www #88: About and Piano pages rewritten, plus two fixes** · [PR #88](https://github.com/travis-horton/www/pull/88) · merged 26.0916.1305 · v3.21.0
- **[Outbound links](https://github.com/travis-horton/www/commit/e00bbca)** · merged 26.0916.1302
  New: the About page now links the places it names: Boise State, the Boise Philharmonic Master Chorale, the Brooklyn Youth Chorus, the College of Idaho, UNC-CH, UNC School of the Arts, the New England Conservatory and NYU. It also links "base six" to seximal.net and your remark about calendars to Wikipedia's Calendar reform article.
  Try it: open https://www.travish.com
- **[Grammar pass](https://github.com/travis-horton/www/commit/e00bbca)** · merged 26.0916.1302
  Fixed: five small wording errors on the About page. It now has a comma after "Boise, Idaho,", says "my first try at college (UNC-CH) was as a math major", uses the US spelling "traveled", reads "spent three months (a "batch")", and says "The software engineer page has…".
- **[About page in your own words](https://github.com/travis-horton/www/commit/dbe8147)** · merged 26.0916.1302
  New: the About page's opening, its books paragraph and its Zig paragraph now use your own wording. The books paragraph ends on your first try at college as a math major, with the wording kept exactly as you wrote it, and the sentence about being stuck on allocators is gone.
- **[Blog sentence removed](https://github.com/travis-horton/www/commit/8371bd2)** · merged 26.0916.1302
  New: the About page no longer says "The blog is sporadic and mostly concerns how computers work." The blog link in the menu is unchanged.
- **[Photo on the right](https://github.com/travis-horton/www/commit/3e93cdc)** · merged 26.0916.1302
  New: the photo on the About page now sits on the right side instead of the left. On a phone it's still centered.
- **[Hobbies paragraph](https://github.com/travis-horton/www/commit/d4c39ff)** · merged 26.0916.1231
  New: the About page's "Away from all that" paragraph is now the one you wrote: board games, skiing, the garden, running, and the escarpment oak bonsai.
- **[Current work first](https://github.com/travis-horton/www/commit/e262600)** · merged 26.0916.1231
  New: the About and Piano pages now open with your current work at Boise State and the Boise Philharmonic Master Chorale, and they describe your College of Idaho position in the past tense. The About page also lost two sentences (one about cooking dinner, one about keeping a daily journal), and its bonsai sentence now ends at the tree.
  Try it: open https://www.travish.com/piano
- **[Performance list](https://github.com/travis-horton/www/commit/2f2138b)** · merged 26.0916.1231
  New: the Piano page now has "Upcoming" and "Past concerts" lists, built from your calendar. Whether a concert counts as upcoming is worked out from today's date, so a past concert can't keep being announced. Entries the calendar couldn't confirm as real performances are kept off the page until you check them.
  Try it: open https://www.travish.com/piano and scroll to Performances
- **[New footer](https://github.com/travis-horton/www/commit/9b3e73e)** · merged 26.0916.1231
  New: the Twitter and Instagram links are gone from the bottom of every page, because you don't use those accounts anymore. In their place, the footer says you're not on social media and points to the contact page. It also links /learn ("courses in base six and toki pona"), which the menu has never shown.
  Try it: open https://www.travish.com and scroll to the bottom
- **[Two layout fixes](https://github.com/travis-horton/www/commit/9b3e73e)** · merged 26.0916.1231
  Fixed: the About photo had no space under it, so the first heading beside it sat right against its bottom edge. It now has room. Smaller headings used to sit exactly halfway between the section above and the one below, so they looked like they belonged to neither. They now sit close to the section they start.
- **[About and Piano pages rewritten](https://github.com/travis-horton/www/commit/2fdc949)** · merged 26.0916.1231
  New: both pages were rewritten on 26.0905, then rewritten again the same day to sound like you rather than like AI (plainer sentences, no em dashes, longer paragraphs). Along the way, Boise State appears on the site for the first time, the three choirs you accompany are correctly credited to Boise State, and the Piano page gained a section on collaborative piano.
  Behind the scenes: an automatic check on the menu links was fixed so it looks only at the menu. The rewritten About page links to the software engineer page too, and the check had been counting both links.
- **[Pages under /programming, /blog and /learn show "not found" again](https://github.com/travis-horton/www/commit/160346b)** · merged 26.0916.1223
  Fixed: a made-up address under /programming, /blog or /learn (like /programming/made-up) showed an empty page instead of the "hm, nothing here" page. It shows the not-found page now.
  Try it: open https://www.travish.com/programming/made-up
- **[Toki pona search no longer blanks the page](https://github.com/travis-horton/www/commit/df3480f)** · merged 26.0916.0145
  Fixed: typing certain words into the toki pona search box, like "constructor", made the whole page go blank instead of just showing no results. Those words now simply find nothing.

**www #86: the li rule, and the asteroids game's address** · [PR #86](https://github.com/travis-horton/www/pull/86) · merged 26.0916.0143 · v3.20.2
- **[The li rule, stated correctly](https://github.com/travis-horton/www/commit/399bbae)** · merged 26.0916.0135
  Fixed: Levels 1 and 2 of the toki pona course said li is dropped "after mi and sina", which is wrong. It's dropped only when mi or sina is the whole subject, so "mi en sina li musi" keeps it. Both levels now say that, and Level 1 points ahead to Level 10, where it's taught in full.
  Try it: open https://www.travish.com/learn/toki-pona/1
- **[Asteroids game address](https://github.com/travis-horton/www/commit/01901ff)** · merged 26.0916.0130
  Behind the scenes: the site's link to your asteroids game's code now uses its new GitHub address under travis-horton instead of the old kiddspazz name. The old address still forwarded, so nothing had been broken, and the game itself didn't change.

**www #83: private material removed** · [PR #83](https://github.com/travis-horton/www/pull/83) · merged 26.0913.1817 · v3.20.1
- Behind the scenes: private material was removed from the site's files and history.

**www #80: /learn search for both courses, and the phone menu icons** · [PR #80](https://github.com/travis-horton/www/pull/80) · merged 26.0911.1113 · v3.20.0
- **[Seximal search, and one box for both courses](https://github.com/travis-horton/www/pull/78)** · merged 26.0911.1025
  New: the seximal course page got its own search box. Type a number word ("dozen", "nif"), a whole spoken number ("thirsy-two nif fifsy-one"), a numeral like 20 (answered both ways: read as base six, and read as an ordinary number), or a topic like "carry", and it links you to the level where that lives. The main /learn page now has one search box that covers both courses, with the answers grouped under "toki pona" and "seximal".
  Try it: open https://www.travish.com/learn and type 20
- **[Phone menu icons](https://github.com/travis-horton/www/pull/79)** · merged 26.0911.1001
  Fixed: on a phone, where the site's menu is just five icons, all five showed as broken images, so the menu was unusable there (on a computer the menu shows words, so it looked fine). All five icons now show.
  Behind the scenes: added an automatic check that fails if a menu icon ever loses its picture again.
  Try it: open https://www.travish.com on your phone

**www #76: asteroids high score, and library updates** · [PR #76](https://github.com/travis-horton/www/pull/76) · merged 26.0910.2047 · v3.19.3
- **[Page-navigation update made to work](https://github.com/travis-horton/www/commit/0179874)** · merged 26.0910.2044
  Behind the scenes: brought the page-navigation library update from www #70 (below) into the dev copy of the site, and made the two adjustments it needed before the site would build and its automatic checks would pass. With it, the site's list of known security warnings from outside code libraries went from 2 to 0.
- **[Security patch to a code-style tool](https://github.com/travis-horton/www/commit/fdc430f)** · merged 26.0910.2034
  Behind the scenes: a security patch to a library used only by the code-style checker, which never reaches visitors. Known security warnings went from 3 to 2.
- **[Asteroids high score, saved in your browser](https://github.com/travis-horton/www/commit/07bbd97)** · merged 26.0910.2034
  Fixed: the asteroids game's high score was supposed to come from an online database, but that had quietly stopped working. Now your best score is saved in your own browser: it starts at 0, updates the moment you beat it, and survives a reload.
  Behind the scenes: the online-database code, which every page of the site was downloading just for that one number, is gone, cutting the known security warnings from 13 to 3.
  Try it: open https://www.travish.com/programming/asteroids

**www #70: page-navigation library update** · [PR #70](https://github.com/travis-horton/www/pull/70) · merged 26.0910.2035 · v3.19.2
- Behind the scenes: an automatic security update to the library that moves you between the site's pages (React Router, version 6 to 7). It needed two small adjustments before the site would build with it; those came in with www #76 (above).

**www #72: www.travish.com back online** · [PR #72](https://github.com/travis-horton/www/pull/72) · merged 26.0908.0732 · v3.19.1
- Fixed: for about 12 hours after the 26.0907.1900 release, www.travish.com showed a "service unavailable" page, while plain travish.com kept working. The new calendar doorbell (www #69, below) needed a folder to write its notes in, that folder had only been set up for the copy of the site serving plain travish.com, and the copy behind www.travish.com refused to start without it. The site now creates that folder itself, so both start on their own ([PR #71](https://github.com/travis-horton/www/pull/71)).

**www #69: /learn search, the seximal clock, and the calendar doorbell** · [PR #69](https://github.com/travis-horton/www/pull/69) · merged 26.0907.1900 · v3.19.0
- **[Calendar doorbell for Praxis](https://github.com/travis-horton/www/pull/68)** · merged 26.0907.1856
  New: the site gained a private address that Google Calendar "rings" whenever your calendar changes, so Praxis learns that something changed instead of having to keep re-checking the calendar itself. The site only writes down that the bell rang (Google never says what changed); Praxis on your laptop reads that note and fetches the change itself.
- **[Clock: big face moved off the top](https://github.com/travis-horton/www/commit/07166de)** · merged 26.0906.0914
  New: the clock page no longer opens with the big analog face. It now appears only as the first of the five faces in the gallery at the bottom, so it's weighed against the others instead of shown as the answer.
- **[Clock: fixes from a review](https://github.com/travis-horton/www/commit/07166de)** · merged 26.0906.0914
  Fixed: the seven-hand face showed the wrong digits at 270 moments a day, including exactly 16:00, and three of its hands were drawn too pale, so the shading ran out of order; both are right now. Also fixed for keyboard and screen-reader users: the focus outline was invisible on the selected button, face titles ran their number into their name ("1Three hands…"), and the palest hands were raised to a visible contrast.
- **[Clock: vote buttons tried and pulled](https://github.com/travis-horton/www/commit/3f4cc82)** · merged 26.0906.0914
  New: each face in the gallery briefly had up- and down-vote buttons, but they could only save to the visitor's own browser, so nobody could ever count them, and they came off about an hour later. The page now says plainly that there's nowhere to count votes yet, and that counting them is a job for the site's future Zig back end.
- **["nif" explained on first use](https://github.com/travis-horton/www/commit/3d1c329)** · merged 26.0906.0914
  New: the clock page's opening sentence now explains "nif" (thirty-six, written 100 in base six and 10 in base 36) the first time it appears, and the page uses the word from then on.
- **[Clock: moved to /programming/clock, with a gallery of faces](https://github.com/travis-horton/www/commit/f747959)** · merged 26.0906.0914
  New: the clock moved under the programming section and is linked from its projects list as "Seximal clock"; the old /clock address forwards there. The bottom of the page became a gallery of five possible clock faces, introduced as "a few ways" the units could reach a face, each with a live demo, a description, and the case for and against it.
  Try it: open https://www.travish.com/programming/clock
- **[Clock: six marks, seven hands](https://github.com/travis-horton/www/commit/e6abe86)** · merged 26.0906.0914
  New: a face with only six marks and seven hands, one hand per unit from watch down to snap, so the seven hands read together as a seven-digit base-six number for the time of day. All the analog hands now sweep smoothly instead of jumping at each tick.
- **[Clock: three sketch faces](https://github.com/travis-horton/www/commit/384d0c4)** · merged 26.0906.0914
  New: three trial faces for showing the newer units: the span as one three-digit number, watch and breath as extra hands, and the watch as a shaded wedge. They became options 2–4 of the gallery the same afternoon.
- **[Clock: the full ladder of units](https://github.com/travis-horton/www/commit/2e0cdf3)** · merged 26.0906.0914
  New: the list of named units grew to eight, each a sixth of the one above: day, watch, lapse, span, lull, breath, moment, snap. The page says whose each name is: four from seximal.net's original list, span and snap from Justin Kunimune's additions, and watch and breath proposed on this page and marked with a star.
- **[Clock: exact and rounded lengths](https://github.com/travis-horton/www/commit/e910f3c)** · merged 26.0906.0914
  New: the units list now uses "=" where a unit comes out exact in ordinary time (a lapse is exactly 40 minutes) and "≈" where the length is rounded. The "% of the day gone" figure now shows three decimal places, so it moves on every tick instead of holding still and then jumping.
- **[Clock: page width](https://github.com/travis-horton/www/commit/7684699)** · merged 26.0906.0914
  Fixed: the clock page was narrower than every other page on the site; it now uses the same width, with the dial taking about 40% of it (80% on a phone). The phone size only started working with a later fix that afternoon, which moved a setting that had been in the wrong order.
- **[Clock: an analog face](https://github.com/travis-horton/www/commit/bbdb86d)** · merged 26.0906.0914
  New: an analog face with 36 marks around the rim and three hands; the slowest goes around once a day, so midnight is at the top and midday at the bottom. An outer ring labels every mark with its base-36 (niftimal) character, and the seximal/niftimal switch now chooses which ring stands out.
- **[Clock: the units get their real names](https://github.com/travis-horton/www/commit/bbdb86d)** · merged 26.0906.0914
  New: "hour, minute, second" became the names from seximal.net: lapse (40 minutes), lull (about 67 seconds) and moment (about 1.85 seconds), each written out with its fraction of a day and its ordinary length. Shortly after, the lull was described as "a niftilapse" (a thirty-sixth of a lapse), so every unit is measured against the one just above it.
- **[Clock: ticks on the seximal second](https://github.com/travis-horton/www/commit/cbecd84)** · merged 26.0906.0914
  Fixed: the clock updated once per ordinary second, so it showed the same seximal second twice and then skipped one. It now updates exactly on each seximal second (about 1.85 ordinary seconds) and can't drift.
- **[Clock: unit counts in base six](https://github.com/travis-horton/www/commit/0cc6ffb)** · merged 26.0906.0914
  Fixed: the units table said "36 a day, 36 an hour, 36 a minute" in ordinary numbers, on a page arguing for base six. It now writes that count as 100 in base six and 10 in base 36; the real-length column stays in ordinary units on purpose, since it's there to help you get your bearings.
- **[A seximal clock](https://github.com/travis-horton/www/pull/65)** · merged 26.0905.1247
  New: a clock page that tells the time of day in base six: the day is cut into 36 parts, each cut into 36, and each of those into 36 again, shown as three pairs of digits like 23:41:05, or, with a switch, as three base-36 characters like F:P:5. It also reads the whole time aloud in your seximal number names, shows a bar of how much of the day has gone, and gives the ordinary time for reference. (Moved to /programming/clock later the same day, above; the old address still forwards there.)
- **[luka back as "five" in the numbers lesson](https://github.com/travis-horton/www/pull/66)** · merged 26.0905.1239
  New: the toki pona numbers lesson (Level 9) now brings back luka as "five", with mute (twenty) and ale (hundred), as "again" cards tagged with the level where each was first taught, and drills them; two of its sentences now use luka as a number. The lesson's summary now says the numbers add up ("luka tu is seven"), and the course states openly that it teaches this adding style rather than the plainer one-two-many style. Search keeps up: "twenty" or "20" finds mute.
  Try it: open https://www.travish.com/learn/toki-pona/9
- **[toki pona search: better English lookups](https://github.com/travis-horton/www/commit/2d3012a)** · merged 26.0828.2238
  Fixed: most English searches (13 of 16 tried) found nothing or something misleading. Now a two-word search must match both words ("land animal" finds only soweli), plurals and digits work ("5" finds luka, like "five"), and filler words no longer cause false matches. Screen readers now announce the results as you type.
- **[toki pona search: words met in the explanations](https://github.com/travis-horton/www/commit/c06b714)** · merged 26.0828.2228
  New: the search now also lists lessons where a word only comes up in the explanation text, labelled "mentioned", not just in the exercises. About 30 such appearances across 8 of the 10 levels had been missing, and the English word "a" is kept from being confused with the toki pona word "a".
- **[toki pona search](https://github.com/travis-horton/www/commit/2a3f09b)** · merged 26.0828.2205
  New: a search box on the toki pona course page for "where did I meet this word?". Type a toki pona word to see its meaning, its glyph and every lesson that teaches or uses it; type an English word ("five", "hand") to find the toki pona word; or paste sitelen pona glyphs to see which words they are.
  Try it: open https://www.travish.com/learn/toki-pona and type luka

## August 2026

**www #64: /learn arrives** · [PR #64](https://github.com/travis-horton/www/pull/64) · merged 26.0818.1714 · v3.18.0
- **[Switched from yarn to npm](https://github.com/travis-horton/www/commit/ea3d942)** · merged 26.0818.1708
  Behind the scenes: the site switched the tool that installs its outside code libraries from yarn to npm, in the build that makes the live site and in the setup instructions.
  Try it: open Terminal and paste
      cd ~/code/www && npm test
- **[Claude Code settings kept out](https://github.com/travis-horton/www/commit/89089af)** · merged 26.0818.1615
  Behind the scenes: the site's files now ignore Claude Code's personal settings folder, so it can't be saved into this public repo by accident.
- **[toki pona course](https://github.com/travis-horton/www/commit/2a08e47)** · merged 26.0817.1505
  New: a toki pona course at /learn with all ten levels from your worksheets, 121 sitelen pona glyphs, and a review mode that draws on every word met so far and leans toward the ones you've missed. Every question makes you give your answer before it shows the right one; single words and glyphs are marked automatically, while whole sentences you mark yourself, since they have many fair translations.
  Try it: open https://www.travish.com/learn/toki-pona (review: https://www.travish.com/learn/toki-pona/review)
- **[Seximal course](https://github.com/travis-horton/www/commit/2a08e47)** · merged 26.0817.1505
  New: a seximal (base-six counting) course at /learn with five levels that follow your printed worksheets and use your own number names (six, dozen, thirsy, foursy, fifsy, nif). Each level opens with a short lesson, then makes up fresh questions, so it never runs out, and you type each answer before seeing the right one.
  Try it: open https://www.travish.com/learn/seximal
- **[The Zig back-end plan](https://github.com/travis-horton/www/commit/aa858c7)** · merged 26.0816.2157
  Behind the scenes: the written plan for giving the site a back end in Zig (how it fits together, and the phases to build it in) was saved into the site's files. Until then it existed only on your laptop.

## March 2026

**Follow-up fixes and a version number in the footer** · [commits](https://github.com/travis-horton/www/commits/main?since=2026-03-09&until=2026-03-09) · merged 26.0309.1222 · v3.17.0
- **[Journal page cleanup](https://github.com/travis-horton/www/commit/7004c6a)** · merged 26.0309.1222
  Fixed: the hidden journal page showed an out-of-date date, and it could break on a day that was missing one of its scores. Both were fixed, and the site's version number went up to 2.2.1. <!-- unsure: the journal page's own files were later removed from the repo's history, so only the version change can still be seen; this reading comes from the commit message --> (The journal page was later removed on 26.0913.)
- **[Dev-site build fix](https://github.com/travis-horton/www/commit/9375c09)** · merged 26.0309.1201
  Fixed: the automatic build of the dev copy of the site (kiddspazz.com) stopped fetching the programming projects that live in their own separate folders (asteroids, the seximal clock and the rest), so it couldn't put the site together. It fetches them again now, and a capitalization warning in the build recipe was also fixed. <!-- unsure: whether the build failed outright or only warned; the fix follows a build change made six minutes earlier -->
- **[Version in the footer](https://github.com/travis-horton/www/commit/feb8904)** · merged 26.0309.1155
  New: the footer now shows the site's version number plus a short code for the exact saved change it was built from (for example "v2.2.0.1105fdc"), and the copyright year changed from '21 to '26.
  Try it: open https://www.travish.com/ and look at the bottom of the page.
- **[Seximal clock timer](https://github.com/travis-horton/www/commit/feb8904)** · merged 26.0309.1155
  Fixed: the seximal clock threw away and restarted its ticking timer on every redraw, 50 times a second. It now starts the timer once when the page opens.
  Try it: open https://www.travish.com/programming/seximal-time-keeping
- **[Email link](https://github.com/travis-horton/www/commit/feb8904)** · merged 26.0309.1155
  Fixed: clicking your email address on the Contact page opened a blank extra browser tab as well as your mail program. It only opens the mail program now.
- **[Blog post layout](https://github.com/travis-horton/www/commit/feb8904)** · merged 26.0309.1155
  Fixed: in the blog post "JavaScript's this", the quotes and the numbered list were tucked inside paragraphs, which browsers treat as broken page structure; they're laid out properly now. In "The D Flip-Flop, pt 1", the two links that open in a new tab now do it safely, without giving the other website a handle back to your page.
- **[Small tidy-ups](https://github.com/travis-horton/www/commit/feb8904)** · merged 26.0309.1155
  Behind the scenes: the top menu is now labelled "Main navigation" for screen readers, and three style files lost stray doubled semicolons.

## February 2026

**The first modernization with Claude** · [commits](https://github.com/travis-horton/www/commits/main?since=2026-02-26&until=2026-02-26) · merged 26.0226.1929 · v3.16.0
- **[Page-address upgrade](https://github.com/travis-horton/www/commit/754456a)** · merged 26.0226.1929
  Behind the scenes: the part of the site that decides which page to show for each address was upgraded to its next major version (React Router 6). Every page kept its address, and the blog's table of contents became its own separate piece.
- **[Asteroids restart](https://github.com/travis-horton/www/commit/115f6f4)** · merged 26.0226.1923
  Fixed: each time you pressed R to restart the asteroids game, it started another copy of the game's animation on top of the old one, so the work piled up with every restart. The old one now stops first, and the R key is detected the modern way.
  Try it: open https://www.travish.com/programming/asteroids and press R a few times.
- **[Blog headings](https://github.com/travis-horton/www/commit/115f6f4)** · merged 26.0226.1923
  Fixed: in the blog post "JavaScript's this", the section headings sat inside paragraphs, which browsers treat as broken page structure. They are proper headings now.
- **[Blank pictures](https://github.com/travis-horton/www/commit/115f6f4)** · merged 26.0226.1923
  Fixed: a picture on the site that wasn't given an image tried to load a file literally called "none". It now just stays empty.
- **[Old helpers removed, more checks](https://github.com/travis-horton/www/commit/3adc678)** · merged 26.0226.1905
  Behind the scenes: removed the two page-title helper libraries the site no longer used. Added automatic checks that pictures show a small preview until the full image loads, that the top menu underlines the page you're on, and that the hidden journal page draws correctly.
- **[Links to other sites](https://github.com/travis-horton/www/commit/ee8a1b1)** · merged 26.0226.1259
  Fixed: links to other websites on the homepage, the Contact page and the footer (Twitter, Instagram, LinkedIn, GitHub and the two blogs you follow) now open in a new tab without giving the other site a handle back to your page. The two blog links had a misspelled setting, so they kept reusing one oddly named tab; that's fixed too. (The footer's Twitter and Instagram icons were later removed on 26.0916.)
- **[Asteroids high-score settings](https://github.com/travis-horton/www/commit/ee8a1b1)** · merged 26.0226.1259
  Behind the scenes: the settings that connect the asteroids game's shared high score to its online database were moved out of the site's public code into a private settings file. The connection itself was updated to the database's newer way of working at 19:23 the same day. (Later replaced on 26.0910 by keeping the high score in each player's own browser.)
- **[More checks](https://github.com/travis-horton/www/commit/557e1af)** · merged 26.0226.1219
  Behind the scenes: added automatic checks that every menu link appears, that the homepage heading "Travis Horton" shows, and that nothing on the site uses old-style code that React's strict checking mode warns about.
- **[Page-title crash](https://github.com/travis-horton/www/commit/735e23a)** · merged 26.0226.1213
  Fixed: after that morning's React upgrade, the helper that set the browser-tab title, the tab icon and the phone-screen sizing could crash the site in the browser. Those settings are now written straight into the page, so the helper isn't needed.
- **[Not-found page](https://github.com/travis-horton/www/commit/3c216e8)** · merged 26.0226.0751
  New: an address that doesn't exist now shows a "404 — hm, nothing here" page with a 🤔 and a "take me home" link. Before, you just got the header and footer with nothing between them.
  Try it: open https://www.travish.com/no-such-page
- **[Menu highlight](https://github.com/travis-horton/www/commit/3c216e8)** · merged 26.0226.0751
  Fixed: the underlined tab in the top menu followed your clicks rather than the page you were actually on, so after the browser's Back button it could underline the wrong page. It now always matches the page you're on. <!-- unsure: plain reading of the change; the Back-button symptom is inferred, not reported -->
- **[Blog post links](https://github.com/travis-horton/www/commit/3c216e8)** · merged 26.0226.0751
  Fixed: on the blog's table of contents, the links to "The D Flip-Flop, pt 1" and "The First Blog Post" reloaded the whole site. They now open instantly like the other links.
- **[Startup and tidy](https://github.com/travis-horton/www/commit/3c216e8)** · merged 26.0226.0751
  Behind the scenes: the site now starts up the way React 18 expects, the Programming page's text moved into its own file, and "The First Blog Post" was tidied to the code style rules with no change to its words.
- **[Picture defaults](https://github.com/travis-horton/www/commit/a1adcac)** · merged 26.0226.0744
  Behind the scenes: the piece that shows pictures now sets its default size and description the modern way, because React is retiring the old way.
- **[Page-title helper swap](https://github.com/travis-horton/www/commit/d4528dd)** · merged 26.0226.0743
  Behind the scenes: swapped the helper that sets the browser-tab title for its maintained successor, which React's strict checking mode doesn't warn about. (Undone at 07:51 the same morning, and the helper was removed entirely at 12:13.)
- **[Automatic tests and upgrades](https://github.com/travis-horton/www/commit/6d9dd62)** · merged 26.0226.0742
  Behind the scenes: the site got its first automatic tests, checking that the whole site, each page (home, programming, piano, blog, contact) and the header and picture pieces load without crashing. It also moved up to React 18, a newer version of the Firebase database tools, and the finished release of the Parcel build tool instead of a test version.
  Try it: open Terminal and paste
      cd ~/code/www && npm test

## July 2024

**www #58: hidden journal page** · [PR #58](https://github.com/travis-horton/www/pull/58) · merged 24.0702.1615 · v3.15.0
- **[Journal page](https://github.com/travis-horton/www/pull/57)** · merged 24.0702.1615
  New: your daily journal was added to the site as a hidden page at /journal, not linked from the menu. (Later removed on 26.0913.)
- **[Catching up](https://github.com/travis-horton/www/commit/a6a3427)** · merged 24.0702.1615
  Behind the scenes: the working copy was caught up with the main copy before release; no change of its own.

**www #56: seximal clock tidy** · [PR #56](https://github.com/travis-horton/www/pull/56) · merged 24.0702.1603 · v3.14.3
- Behind the scenes: the seximal clock's code was tidied to the style rules, with no visible change.

**www #53: security update** · [PR #53](https://github.com/travis-horton/www/pull/53) · merged 24.0702.1017 · v3.14.2
- Behind the scenes: an automatic security update to a networking library that came along with the Firebase database tools.

**www #54: security update** · [PR #54](https://github.com/travis-horton/www/pull/54) · merged 24.0702.1017 · v3.14.1
- Behind the scenes: an automatic security update to a library the build tools use to match groups of file names.

**www #55: homepage wording** · [PR #55](https://github.com/travis-horton/www/pull/55) · merged 24.0702.1011 · v3.14.0
- New: the homepage stopped listing "Choir Director" among your roles at the College of Idaho; it now says Professor of Piano and staff pianist.
  Behind the scenes: the homepage and Programming page code was tidied to the style rules, with no other change to their words.

## June 2024

**www #48: security update** · [PR #48](https://github.com/travis-horton/www/pull/48) · merged 24.0606.1314 · v3.13.2
- Behind the scenes: an automatic security update to a library the build tools use to read settings files.

**www #52: linting (duplicate)** · [PR #52](https://github.com/travis-horton/www/pull/52) · merged 24.0606.1314 · v3.13.1
- Behind the scenes: brought in the dev copy of the same "Linting" change that had been put straight onto main nine minutes earlier (the entry below), so nothing new reached the site.

**Linting, Piano page and seximal clock** · [commits](https://github.com/travis-horton/www/commits/main?since=2024-06-06&until=2024-06-06) · merged 24.0606.1305 · v3.13.0
- **[Piano page](https://github.com/travis-horton/www/commit/1566c71)** · merged 24.0606.1305
  New: the Piano page gained two paragraphs about your 23–24 school year at the college: stepping in as choir director, and then being offered a place on the piano faculty. (Later replaced on 26.0916 by a rewritten Piano page.)
- **[Seximal clock touches](https://github.com/travis-horton/www/commit/1566c71)** · merged 24.0606.1305
  New: the seximal clock gained decorative triangles, and noon now points straight up. Notes with pictures were also added to the clock's own folder; they don't show on the site.
  Try it: open https://www.travish.com/programming/seximal-time-keeping
- **[Roguelike placeholder](https://github.com/travis-horton/www/commit/1566c71)** · merged 24.0606.1305
  Behind the scenes: an empty placeholder page for a future roguelike game was added to the code. It isn't linked or published on the site.
- **[Code tidy](https://github.com/travis-horton/www/commit/1566c71)** · merged 24.0606.1305
  Behind the scenes: the site and the five older project folders (asteroids, orbitz, perlin noise, polygon race and the ray tracer) were tidied to the code style rules, and the style check now covers the whole site. The tool that prepares images for the site moved from a test version to a finished release.

## February 2024

**www #51: binary numerals** · [PR #51](https://github.com/travis-horton/www/pull/51) · merged 24.0201.1202 · v3.12.0
- **[Binary page](https://github.com/travis-horton/www/commit/697472e)** · merged 24.0201.1202
  New: a work-in-progress "Binary" page. Type a number into the box and it is drawn in a made-up way of writing binary, where each digit is a short or tall stroke and the strokes come in groups of four on an underline; below it is a chart of 0 through 15 written the same way.
  Try it: open https://www.travish.com/programming/binary
- **[Programming page intro](https://github.com/travis-horton/www/commit/0c0cb26)** · merged 24.0201.1202
  New: the Programming page's opening paragraphs about your job at honor were replaced with a short, casual intro: you like moving pixels around, doing the math to make them move in interesting ways, and fiddling with your vim setup. The Binary page was also added to its "Works in progress" list.

## January 2024

**www #50: seximal clock** · [PR #50](https://github.com/travis-horton/www/pull/50) · merged 24.0110.1218 · v3.11.0
- **[Seximal clock](https://github.com/travis-horton/www/commit/0eee2ab)** · merged 24.0110.1218
  New: a work-in-progress clock page in seximal (base six). The day is split into 36 "hours" of 36 "minutes" of 36 "seconds", drawn as hexagons turning inside hexagons, with a clock face and the time written out.
  Try it: open https://www.travish.com/programming/seximal-time-keeping
- **[Works in progress list](https://github.com/travis-horton/www/commit/788f5cd)** · merged 24.0110.1218
  New: on the Programming page, the old "Works in progress" paragraphs about rebuilding the site in React and its automatic builds were replaced by a list holding the seximal clock link, which moved there from the Personal Projects list.
  Behind the scenes: the build tool's list of browser versions was refreshed.

**www #49: bio update and asteroids fix** · [PR #49](https://github.com/travis-horton/www/pull/49) · merged 24.0103.1959 · v3.10.0
- **[Asteroids fix](https://github.com/travis-horton/www/commit/5336062)** · merged 24.0103.1959
  Fixed: the rocks in the asteroids game had lost track of their own size, so they didn't draw properly. They draw at the right size again. <!-- unsure: the change restores the rock's size value; the exact on-screen symptom (invisible vs. misshapen rocks) is inferred -->
- **[Homepage bio](https://github.com/travis-horton/www/commit/767951c)** · merged 24.0103.1959
  New: the homepage introduction was brought up to date. It stopped saying you were learning Rust, named your roles at the College of Idaho (Professor of Piano, choir director and staff pianist), and said your daytime programming job ended in 23.11.
  Behind the scenes: the Programming page's code was tidied, with no change to its words.
- **[Server notes](https://github.com/travis-horton/www/commit/44960c3)** · merged 24.0103.1959
  Behind the scenes: your notes on how the site's server is set up moved from a separate notes file into the project's README.

## December 2022

**www #47: the About Me biography rewritten** · [PR #47](https://github.com/travis-horton/www/pull/47) · merged 22.1230.1401 · v3.9.0
- New: the About Me biography was rewritten. It now opens with how your days were split between programming in the morning and piano teaching in the afternoon and evening, adds Python to the languages you list, and moves your life story under a new "A little background" heading, ending with a link to the Recurse Center and a "Here are a few things I've built" link to the Software Engineer page. The photo of your cat was taken off the page. (Later replaced on 26.0916 by a rewritten About Me page.)

**www #46: the Python quote, one line at a time** · [PR #46](https://github.com/travis-horton/www/pull/46) · merged 22.1230.1339 · v3.8.3
- Fixed: the "Fun quotes" section on the Software Engineer page ran all nineteen lines of the Python quote together as one long paragraph. Each line now sits on its own line.
  Try it: open https://www.travish.com/programming and scroll to "Fun quotes".

**www #45: deploy clean-up step removed; Asteroids gets tests** · [PR #45](https://github.com/travis-horton/www/pull/45) · merged 22.1230.1325 · v3.8.2
- **[Deploy clean-up step removed](https://github.com/travis-horton/www/commit/7428f6b)** · merged 22.1230.1325
  Behind the scenes: took back out the step that deleted leftover old copies of the site from both servers after every update, 18 minutes after www #43 brought it to main. <!-- unsure: no reason is recorded; most likely the step failed whenever there was nothing to delete -->
- **[Asteroids code reorganized](https://github.com/travis-horton/www/commit/7428f6b)** · merged 22.1230.1325
  Behind the scenes: the site picked up the newest version of your Asteroids game, whose code had been sorted into folders and given automatic tests. The game plays the same.

**www #41: security update** · [PR #41](https://github.com/travis-horton/www/pull/41) · merged 22.1230.1307 · v3.8.1
- Behind the scenes: an automatic security update to the tool that shrinks the site's code so pages load faster.

**www #43: a Python quote, and server housekeeping** · [PR #43](https://github.com/travis-horton/www/pull/43) · merged 22.1230.1307 · v3.8.0
- **[Fun quotes](https://github.com/travis-horton/www/commit/2bef439)** · merged 22.1230.1307
  New: a "Fun quotes" section at the bottom of the Software Engineer page, with the short poem Python prints when you type `import this`. At first its lines ran together as one paragraph (fixed 22.1230 in www #46).
  Try it: open https://www.travish.com/programming and scroll to "Fun quotes".
- **[Setup notes and two rebuilds](https://github.com/travis-horton/www/pull/44)** · merged 22.1230.1307
  Behind the scenes: the credit line on the project's GitHub front page was tidied, and two blank-line changes were made on 22.0417 only to make the servers rebuild the site.
- **[Old copies deleted after each update](https://github.com/travis-horton/www/commit/1a23227)** · merged 22.1230.1307
  Behind the scenes: after each automatic update, first the test copy (22.0417) and then the live site (22.0530) deleted the leftover old copies of the site to free disk space. (Later removed on 22.1230, in www #45.)
- **[Certificate helpers replaced](https://github.com/travis-horton/www/commit/02c6056)** · merged 22.1230.1307
  Behind the scenes: the two helper programs on the test copy's server that route visitors to the site and fetch its https security certificates were swapped for their current, renamed versions and rewired to work together.

## June 2022

**www #40: Asteroids cleaned up** · [PR #40](https://github.com/travis-horton/www/pull/40) · merged 22.0620.2259 · v3.7.0
- **[Asteroids rewritten](https://github.com/travis-horton/www/commit/edc41da)** · merged 22.0620.2259
  New: the site picked up a rewritten version of your Asteroids game, with its code cleaned up and the playing area made a little smaller (432 pixels square instead of 512) so it fits the page better.
  Try it: open https://www.travish.com/programming/asteroids
- **[Three projects tidied](https://github.com/travis-horton/www/commit/202779d)** · merged 22.0620.2259
  Behind the scenes: the site picked up newer versions of Perlin noise, Orbitz and Polygon race whose code had been run through a style checker. Nothing about how they look or move changed.
- **[Test copy at www.kiddspazz.com](https://github.com/travis-horton/www/commit/e0ef29c)** · merged 22.0620.2259
  Behind the scenes: the test copy of the site now answers at www.kiddspazz.com as well as kiddspazz.com, the same way the live site answers at both travish.com and www.travish.com.
- **[Code checker](https://github.com/travis-horton/www/commit/86b6af5)** · merged 22.0620.2259
  Behind the scenes: added an automatic style checker for the site's code and deleted a leftover helper file for listing blog posts that nothing used.

**www #39: an unused leftover removed** · [PR #39](https://github.com/travis-horton/www/pull/39) · merged 22.0620.1457 · v3.6.3
- Behind the scenes: removed one unused piece of code from the Software Engineer page. Nothing visible changed.

**www #38: Polygon race tidied, and a security update** · [PR #38](https://github.com/travis-horton/www/pull/38) · merged 22.0620.1445 · v3.6.2
- **[Polygon race reorganized](https://github.com/travis-horton/www/commit/8c43566)** · merged 22.0620.1445
  Behind the scenes: the site picked up a version of your Polygon race project whose code had been rewritten in about forty small steps for readability (clearer names, smaller pieces). It draws the same thing.
- **[Security update](https://github.com/travis-horton/www/pull/37)** · merged 22.0620.1445
  Behind the scenes: an automatic security update to a data-format library that Firebase (the service then holding the Asteroids high score) depends on.
- **[Server notes](https://github.com/travis-horton/www/commit/ecf43d0)** · merged 22.0620.1445
  Behind the scenes: reworded your notes on running the servers, including why the certificate helper must not be restarted more than five times a week.

## April 2022

**www #36: library refresh and a footer fix** · [PR #36](https://github.com/travis-horton/www/pull/36) · merged 22.0415.1511 · v3.6.1
- **[Library refresh](https://github.com/travis-horton/www/commit/6c3b6c9)** · merged 22.0415.1511
  Behind the scenes: brought all the outside code libraries the site is built with up to date (feature PR [#35](https://github.com/travis-horton/www/pull/35)), with the small adjustments the newer build tool needed.
- **[Footer cursor](https://github.com/travis-horton/www/commit/6c3b6c9)** · merged 22.0415.1511
  Fixed: the copyright line in the footer was meant to show a plain arrow when you hover over it, but a styling mistake meant the rule was ignored. It now works.

## November 2021

**www #30: build fix for the Mac** · [PR #30](https://github.com/travis-horton/www/pull/30) · merged 21.1128.1155 · v3.6.0
- **[Image tool upgrade](https://github.com/travis-horton/www/commit/94f69ee)** · merged 21.1128.1155
  Fixed: the site couldn't be built on your Mac, because the old version of the image-resizing tool the build uses didn't work on macOS. It now uses a newer version that does.
- **[Employer link wording](https://github.com/travis-horton/www/commit/94f69ee)** · merged 21.1128.1155
  New: the link to your then-employer, Honor, on the Software Engineer page now shows the company's name instead of its web address. (Later removed on 24.0103.)

**www #29: employer link fixed** · [PR #29](https://github.com/travis-horton/www/pull/29) · merged 21.1127.0933 · v3.5.2
- Fixed: the link to your then-employer, Honor, on the Software Engineer page was missing its "https://", so it led to a nonexistent page on your own site instead. It now goes to the company's website. (Later removed on 24.0103.)

**www #26: security update** · [PR #26](https://github.com/travis-horton/www/pull/26) · merged 21.1126.1217 · v3.5.1
- Behind the scenes: an automatic security update to a small library the build tools use to read page styles.

**www #28: grey code snippets** · [PR #28](https://github.com/travis-horton/www/pull/28) · merged 21.1126.1217 · v3.5.0
- **[Code snippets shaded](https://github.com/travis-horton/www/commit/924f860)** · merged 21.1126.1217
  New: bits of code in the blog posts and on the Software Engineer page now sit on a light grey background, so they stand out from the text around them.
  Try it: open https://www.travish.com/blog/js-this
- **[GitHub name](https://github.com/travis-horton/www/commit/a1a9a55)** · merged 21.1126.1217
  Fixed: the capitalization pass had changed your GitHub name on the Contact page to "Kiddspazz". It's back to "kiddspazz", the way the account is actually spelled.

**www #27: capitalization, already live** · [PR #27](https://github.com/travis-horton/www/pull/27) · merged 21.1125.2154 · v3.4.1
- Behind the scenes: this release carried the About Me capitalization pass you wrote on 21.1113, but the same edits had already reached the live site directly on 21.1114 (the entry below), so no page changed. The only lasting difference was an upgrade to the image-resizing tool the site's build uses.

**Capital letters and a new job paragraph** · [commits](https://github.com/travis-horton/www/commits/main?since=2021-11-14&until=2021-11-14) · merged 21.1114.1651 · v3.4.0
- **[Capital letters](https://github.com/travis-horton/www/commit/02ad709)** · merged 21.1114.1651
  New: every page switched from all-lowercase to normal capitalization: headings, the About Me biography, the Pianist and Contact pages, the blog button, and the descriptions under each programming project.
  Try it: open https://www.travish.com/programming/perlin-noise
- **[New job on the Software Engineer page](https://github.com/travis-horton/www/commit/02ad709)** · merged 21.1114.1651
  New: the Software Engineer page's opening now describes the programming job you started in late October 2021 and the languages you used there, in place of the old job and its heading. (Later replaced on 24.0103.)

## August 2021

**www #25: typo fix** · [PR #25](https://github.com/travis-horton/www/pull/25) · merged 21.0804.2101 · v3.3.1
- Fixed: "the paragraph your reading now" in the Works in progress section now reads "you're". (Later removed on 24.0103, with the paragraph.)

## July 2021

**www #24: a works-in-progress update** · [PR #24](https://github.com/travis-horton/www/pull/24) · merged 21.0729.1109 · v3.3.0
- **[Works in progress](https://github.com/travis-horton/www/commit/66d2b6b)** · merged 21.0729.1109
  New: the Software Engineer page's "Works in progress" section replaced its Battleship link with three paragraphs about rebuilding this site: the design makeover, React, and the automatic updates to the test copy and the live site. It ended by noting that the paragraph was written 21.0729 at 1100 and was live by 1110. (Later replaced on 24.0103.)
- **[Setup instructions](https://github.com/travis-horton/www/commit/9666bac)** · merged 21.0729.1109
  Behind the scenes: the project's GitHub front page now explains the two extra commands needed to download the programming projects that live in their own repositories.

**www #23: status badges rearranged** · [PR #23](https://github.com/travis-horton/www/pull/23) · merged 21.0728.1808 · v3.2.4
- Behind the scenes: on the project's GitHub front page, the live-site badge now comes before the test-copy badge, the badge for a styling library the site no longer used was removed, and a "last commit" badge was added.

**www #22: status badges fixed** · [PR #22](https://github.com/travis-horton/www/pull/22) · merged 21.0728.1742 · v3.2.3
- Fixed: the live-site badge on the project's GitHub front page was checking a branch that doesn't exist. It now reports on main, so it shows whether the latest live update succeeded.

**www #21: deploy names and badges** · [PR #21](https://github.com/travis-horton/www/pull/21) · merged 21.0728.1734 · v3.2.2
- Behind the scenes: the two automatic updates are now named "development environment" and "production environment" instead of both being called "ci", and the status badges on the project's GitHub front page became clickable.

**www #20: the flip-flop code sample** · [PR #20](https://github.com/travis-horton/www/pull/20) · merged 21.0728.1522 · v3.2.1
- Fixed: the code sample at the end of "The D Flip-Flop, pt 1" showed its curly braces as garbled text codes and had no indentation. It now shows real braces with the lines indented. <!-- unsure: that the braces showed as literal text codes; the change swapped HTML brace codes for real braces -->
  Try it: open https://www.travish.com/blog/the-flip-flop-1 and scroll to the bottom.

**www #19: the blog posts, readable** · [PR #19](https://github.com/travis-horton/www/pull/19) · merged 21.0728.0800 · v3.2.0
- **[Blog posts filled in](https://github.com/travis-horton/www/commit/dddb9cc)** · merged 21.0728.0800
  New: your three 2019 blog posts ("The First Blog Post", "The D Flip-Flop, pt 1" and "JavaScript's `this`") now open as real pages, including the AND-gate diagram. Until now each one only said "i'm working on making these each programmatically displayed...".
  Try it: open https://www.travish.com/blog and click any post.
- **[Tab highlight follows links](https://github.com/travis-horton/www/commit/1d87c9a)** · merged 21.0728.0800
  Fixed: clicking the "here" link on About Me took you to the Software Engineer page, but the header still underlined "about me". The underline now moves to the page you land on.
  Try it: open https://www.travish.com and click "software engineer" in the last paragraph.

**www #18: setup instructions** · [PR #18](https://github.com/travis-horton/www/pull/18) · merged 21.0727.1820 · v3.1.3
- Behind the scenes: tidied the setup instructions on the project's GitHub front page, replaced its "to do: deploy to production" note with "production automatically deploys on merge with main", and added "write tests" to its to-do list.

**www #17: www.travish.com updates reliably** · [PR #17](https://github.com/travis-horton/www/pull/17) · merged 21.0727.1803 · v3.1.2
- Fixed: each live update started a fresh copy of the site for www.travish.com without first stopping the old one, so that address could be left showing the previous version. The old copy is now stopped and removed first. <!-- unsure: inferred from the change; the fix is plain but no failure was recorded -->

**www #16: "stage" becomes "dev"** · [PR #16](https://github.com/travis-horton/www/pull/16) · merged 21.0727.1759 · v3.1.1
- Behind the scenes: the automatic update for the test copy was renamed from "stage" to "dev", and the project's GitHub front page gained a badge for each automatic update and a note on the helpers that handle https.

**www #15: the live site updates itself** · [PR #15](https://github.com/travis-horton/www/pull/15) · merged 21.0727.1748 · v3.1.0
- **[www.travish.com](https://github.com/travis-horton/www/commit/1febcb3)** · merged 21.0727.1748
  New: each live update now starts the site at both travish.com and www.travish.com, each with its own https certificate. (Later changed on 26.0917: travish.com now forwards to www.travish.com.)
- **[About Me links to your projects](https://github.com/travis-horton/www/commit/2534a69)** · merged 21.0727.1748
  New: the word "here" in the About Me paragraph about the Recurse Center became a link to the Software Engineer page. (Later replaced on 22.1230 by a rewritten paragraph that keeps the link.)
- **[Certificate helper left running](https://github.com/travis-horton/www/commit/2534a69)** · merged 21.0727.1748
  Behind the scenes: updates stopped restarting the helper that fetches the https certificates on both servers, because the certificate service allows only about five new certificates a week; notes on setting the helper up by hand were added instead.
- **[Live-site updates finished](https://github.com/travis-horton/www/commit/3c13d06)** · merged 21.0727.1748
  Behind the scenes: the automatic update for travish.com was fixed so it can log in to the live server, finishing what www #14 started: merging into main now updates the live site.

**www #14: the big update** · [PR #14](https://github.com/travis-horton/www/pull/14) · merged 21.0727.1034 · v3.0.0
- **[Automatic updates](https://github.com/travis-horton/www/commit/c548d24)** · merged 21.0727.1034
  Behind the scenes: from here on, pushing work to the dev branch automatically builds the site and puts it on kiddspazz.com, your test copy, and merging into main was set up to do the same for travish.com (that half was finished in www #15). Each copy runs as a self-contained package behind a helper that fetches its https security certificates automatically.
- **[Blog contents page](https://github.com/travis-horton/www/commit/ffb0414)** · merged 21.0727.1034
  New: the Blog page became a dated table of contents for your three 2019 posts, plus a glowing purple "Here's where I write stuff sometimes" button that doesn't do anything. The post pages themselves only showed placeholder text until www #19.
  Try it: open https://www.travish.com/blog
- **[Footer links](https://github.com/travis-horton/www/commit/f85c388)** · merged 21.0727.1034
  New: the Twitter and Instagram icons in the footer became links to your profiles. (Later removed on 26.0916.)
- **[Asteroids high score](https://github.com/travis-horton/www/commit/3122be9)** · merged 21.0727.1034
  New: the Asteroids game kept one shared high score online, using Firebase, so every visitor played against the best score so far. (Later replaced on 26.0910 by a high score kept in each visitor's own browser.)
- **[Your projects inside the site](https://github.com/travis-horton/www/commit/395018b)** · merged 21.0727.1034
  New: the personal projects on the Software Engineer page now run inside the site, each on its own page with a short description: Perlin noise, Ray tracer, Orbitz, Asteroids and (from 21.0705) Polygon race. Game of life was dropped from the list.
  Try it: open https://www.travish.com/programming/ray-tracer
- **[Résumé on the Contact page](https://github.com/travis-horton/www/commit/395018b)** · merged 21.0727.1034
  Fixed: the résumé PDF is now part of the site itself, so the "Resume (pdf)" link on Contact opens it. Before, the link pointed at a file that wasn't part of the rebuilt site.
  Try it: open https://www.travish.com/contact and click "Resume (pdf)".
- **[Pianist page](https://github.com/travis-horton/www/commit/395018b)** · merged 21.0727.1034
  New: the Pianist page lost its large piano photo, and its text now also lists faculty concerts among the playing you do. (Later replaced on 26.0916 by a rewritten Pianist page.)
- **[Page styling rewritten](https://github.com/travis-horton/www/commit/ad5a63f)** · merged 21.0727.1034
  Behind the scenes: the styling for every page and the header was rewritten twice, first in a style library and then (21.0617) back in plain stylesheets, keeping the same fonts and purple accent. <!-- unsure: whether the look changed visibly; colours and fonts match before and after -->
- **[Steady tab labels](https://github.com/travis-horton/www/commit/5cca97f)** · merged 21.0727.1034
  Fixed: clicking a tab in the header made the row of tab labels jump slightly as the purple underline appeared. The labels now stay put.
- **[About Me at the plain address](https://github.com/travis-horton/www/commit/28d86f4)** · merged 21.0727.1034
  Breaking: travish.com now opens About Me directly, instead of jumping to travish.com/home.
  Try it: open https://www.travish.com
- **[About Me wording](https://github.com/travis-horton/www/commit/6b87ce2)** · merged 21.0727.1034
  New: the About Me introduction dropped its aside about never having enough time to learn Rust. (Later replaced on 22.1230.)
- **[How the site is built](https://github.com/travis-horton/www/commit/3bb8954)** · merged 21.0727.1034
  Behind the scenes: the site switched from the React starter kit to a lighter build tool (Parcel) and is now served by a small web server inside its own package; the starter kit's placeholder tests went with it. The project's GitHub front page was rewritten to explain all of this.

## June 2021

**Automatic-check experiment removed** · [commits](https://github.com/travis-horton/www/commits/main?since=2021-06-08&until=2021-06-08) · merged 21.0608.2101 · v2.1.6
- Behind the scenes: deleted the automatic-check experiment from 21.0328 (the entries below). Its replacement, real automatic updates, arrived with www #14.

## March 2021

**www #9: experiment, step 4** · [PR #9](https://github.com/travis-horton/www/pull/9) · merged 21.0328.1812 · v2.1.5
- Fixed: a formatting mistake in the automatic check's instructions, left by www #8, kept it from running. It could run after this. (Later removed on 21.0608.)

**www #8: experiment, step 3** · [PR #8](https://github.com/travis-horton/www/pull/8) · merged 21.0328.1810 · v2.1.4
- Behind the scenes: the automatic check tried logging in to your web server as a test, and was limited to pull requests into main. (Later removed on 21.0608.)

**www #7: experiment, step 2** · [PR #7](https://github.com/travis-horton/www/pull/7) · merged 21.0328.1805 · v2.1.3
- Fixed: the automatic check was set to start on an event GitHub doesn't have, so it never ran. It now starts when a pull request is opened into dev or main. (Later removed on 21.0608.)

**www #6: experiment, step 1** · [PR #6](https://github.com/travis-horton/www/pull/6) · merged 21.0328.1802 · v2.1.2
- Behind the scenes: added one line to the project's GitHub front page, only to see whether the new automatic check would run. (Later removed on 21.0608.)

**An automatic check, first try** · [commits](https://github.com/travis-horton/www/commits/main?since=2021-03-28&until=2021-03-28) · merged 21.0328.1801 · v2.1.1
- **[Trigger changed](https://github.com/travis-horton/www/commit/4ecc782)** · merged 21.0328.1801
  Behind the scenes: tried to make the check run on merges into dev or main instead, using an event name GitHub doesn't recognise (fixed in www #7). (Later removed on 21.0608.)
- **[GitHub's sample check](https://github.com/travis-horton/www/commit/77ffbdb)** · merged 21.0328.1758
  Behind the scenes: added GitHub's sample automatic check, which only printed "Hello, world!" whenever work reached main. (Later removed on 21.0608.)

**www #5: browser-tab icon** · [PR #5](https://github.com/travis-horton/www/pull/5) · merged 21.0328.1753 · v2.1.0
- **[Tab icon](https://github.com/travis-horton/www/commit/e814cbd)** · merged 21.0328.1753
  Fixed: the rebuilt site pointed at its browser-tab icon by a path that didn't survive the build, so no icon showed. The icon is now packaged with the site and appears in the tab.
  Try it: open https://www.travish.com and look at the icon on the browser tab.
- **[Job heading](https://github.com/travis-horton/www/commit/e814cbd)** · merged 21.0328.1753
  New: the Software Engineer page's job heading was reworded from "front-end engineer" to "client-side engineer". (Later changed back on 21.0727.)
- **[Library pin](https://github.com/travis-horton/www/commit/e814cbd)** · merged 21.0328.1753
  Behind the scenes: pinned a small image-checking library to a specific newer version. <!-- unsure: probably to avoid a known security problem in older versions; the commit doesn't say -->

**www #4: security update** · [PR #4](https://github.com/travis-horton/www/pull/4) · merged 21.0328.1627 · v2.0.1
- Behind the scenes: an automatic security update to a helper library used by the React starter kit's development tools.

**www #3: the site rebuilt in React (v2.0.0)** · [PR #3](https://github.com/travis-horton/www/pull/3) · merged 21.0328.1624 · v2.0.0
- **[Crisp tab icons](https://github.com/travis-horton/www/commit/f54a47b)** · merged 21.0328.1624
  New: the five header tabs got sharp drawn icons that stay crisp at any size (an "i" for about me, a keyboard, a piano, a blog icon and a contact icon). On a phone the icons stand in for the tab names.
  Try it: open https://www.travish.com on your phone.
- **[Photos that sharpen as they load](https://github.com/travis-horton/www/commit/74822f5)** · merged 21.0328.1624
  New: photos first show a small blurry version right away, then fade to the full photo once it has downloaded, so the page never sits empty. It started with your headshot and the cat photo on About Me.
  Try it: open https://www.travish.com and watch the headshot on a slow connection.
- **[Contact page](https://github.com/travis-horton/www/commit/03c81ba)** · merged 21.0328.1624
  New: a Contact page with your email, Twitter, Instagram and LinkedIn, a résumé link, your GitHub, and two programming blogs you follow; it replaced an "accounting" tab from the early drafts. The résumé link pointed at a file that wasn't part of the rebuilt site, so it likely didn't open until 21.0727. <!-- unsure: depends on whether the server still held an old copy of the file then -->
  Try it: open https://www.travish.com/contact
- **[The new look](https://github.com/travis-horton/www/commit/e185990)** · merged 21.0328.1624
  New: headings in the Arkhip typeface and body text in Century Gothic, dark text on white, with a layout that rearranges itself for phone screens (built 21.0216–0223). The site still uses both fonts and the purple accent today.
  Try it: open https://www.travish.com/programming
- **[Header tabs](https://github.com/travis-horton/www/commit/0ee668e)** · merged 21.0328.1624
  New: a header that stays at the top of the window as you scroll, with five tabs (about me, software engineer, pianist, blog, contact); the page you're on is underlined in purple. On 21.0321 the underline was fixed so it also appears when the address ends in "/".
  Try it: open https://www.travish.com/piano
- **[The five pages](https://github.com/travis-horton/www/commit/484542a)** · merged 21.0328.1624
  New: About Me (your headshot, the titles "software engineer, pianist, accountant", a short biography and a photo of your cat), a Software Engineer page (your then-current job at Bodybuilding.com, personal projects, goals, works in progress and next projects), a Pianist page about where you teach and accompany, and a one-line Blog placeholder; the browser tab read "thor". About Me lived at travish.com/home. (About Me moved to the plain address on 21.0727; the tab title changed on 26.0917.)
- **[Starting from scratch](https://github.com/travis-horton/www/commit/785b41e)** · merged 21.0328.1624
  Removed: on 21.0214 the whole hand-built site was deleted to start over in React: the portfolio pages, the old blog, the contact page and the PHP hit counter. The project links on the new Software Engineer page still pointed at the old addresses until 21.0727. <!-- unsure: whether those project links worked on the live server in between -->
- **[The journal comes back out](https://github.com/travis-horton/www/commit/77936ba)** · merged 21.0328.1624
  Behind the scenes: your daily journal, added to the site on 20.1216, was moved into a hidden folder four minutes later and then removed from the site's files on 20.1223.

## December 2020

**Your journal comes back to the site** · [commits](https://github.com/travis-horton/www/commits/main?since=2020-12-16&until=2020-12-16) · merged 20.1216.1939 · v1.0.0
- New: your daily journal was added back to the site's files, as a shortcut pointing at the folder where the journal lived rather than a copy of it. <!-- unsure: a shortcut only works if that folder exists on the machine serving the site, so it isn't certain the journal actually appeared on the live site --> (Later removed on 21.0328, when the site was rebuilt.)

## April 2020

**A README, and the journal comes off the site** · [commits](https://github.com/travis-horton/www/commits/main?since=2020-04-26&until=2020-04-26) · merged 20.0426.1118 · v0.4.13
- **[README](https://github.com/travis-horton/www/commit/8d986fa)** · merged 20.0426.1111
  New: a short note at the top of the project's GitHub page saying this is the code for your personal website at travish.com. It admits the real write-up is still to do, and muses that your little projects are just copied in and should probably become separately linked projects. Seven minutes later you retitled its to-do heading ([c750cb2](https://github.com/travis-horton/www/commit/84bf03d)). (Later replaced on 21.0328, when the site was rebuilt.)
- **[Journal removed](https://github.com/travis-horton/www/commit/8d986fa)** · merged 20.0426.1111
  Behind the scenes: your daily journal was removed from the site's files, and git was told to ignore it. Four minutes later you took the ignore rule back out ([1066a0a](https://github.com/travis-horton/www/commit/dee2df4)); the journal stayed off until 20.1216.

## February 2020

**Battleship goes up** · [commits](https://github.com/travis-horton/www/commits/main?since=2020-02-07&until=2020-02-07) · merged 20.0207.1039 · v0.4.12
- New: the Portfolio page got a "Works in Progress" section linking to a playable Battleship game, added as a ready-built copy of your separate Battleship project. (Later removed on 21.0328, when the site was rebuilt.)
  Behind the scenes: the older linked copy of Battleship's source code was taken out, and git was told to ignore a database command-history file.

**A blog typo and the footer year** · [commits](https://github.com/travis-horton/www/commits/main?since=2020-02-07&until=2020-02-07) · merged 20.0207.1034 · v0.4.11
- **[Typo in the JavaScript post](https://github.com/travis-horton/www/commit/6a6ac12)** · merged 20.0207.1034
  Fixed: the JavaScript `this` post said a constructor's `this` is "the new object beign created". It now says "being created".
  Try it: open https://www.travish.com/blog/js-this
- **[Footer year](https://github.com/travis-horton/www/commit/6a6ac12)** · merged 20.0207.1034
  New: the copyright line at the bottom of every page changed from ©'18 to ©'20. (Later replaced on 21.0328 by the rebuilt site's footer.)
- **[Links-page idea](https://github.com/travis-horton/www/commit/6a6ac12)** · merged 20.0207.1034
  Behind the scenes: a note-to-self in the site's notes file: maybe add a page of favorite links, starting with the "Wat" talk from Destroy All Software.

## November 2019

**Two draft posts touched up** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-11-06&until=2019-11-06) · merged 19.1106.1425 · v0.4.10
- **[Compiler draft](https://github.com/travis-horton/www/commit/9c8de76)** · merged 19.1106.1425
  Behind the scenes: the draft "What is a compiler and why do I need it?" gained a remark from jfo (Jeff Fowler) that "compile" really means, more generally, turning something into another format. It was still a draft and didn't appear on the blog.
- **[Flip-Flop pt 2 tab title](https://github.com/travis-horton/www/commit/4f2b6d3)** · merged 19.1106.0833
  Fixed: the draft of "The D Flip-Flop, pt 2" showed "pt 1" in the browser tab. It now says "pt 2".

**The compiler draft grows** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-11-04&until=2019-11-04) · merged 19.1104.1908 · v0.4.9
- Behind the scenes: the draft "What is a compiler and why do I need it?" got tighter definitions of a compiler and a linker, plus a new section walking through Rust's compiler step by step, from the code you write to a runnable program. It stayed a draft and was never listed on the blog.

**A visitor counter** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-11-04&until=2019-11-04) · merged 19.1104.1827 · v0.4.8
- **[Visitor counter](https://github.com/travis-horton/www/commit/1214e9a)** · merged 19.1104.1827
  New: a page that says "Number of visitors:" and a count, adding one each time it's opened and keeping the total in a small database on the server. It had its own address and wasn't linked from the menu; your notes file got a line about the database behind it. (Later removed on 21.0328, when the site was rebuilt.)
- **[Ray Tracer at its old address](https://github.com/travis-horton/www/commit/1214e9a)** · merged 19.1104.1827
  New: a copy of the Ray Tracer was put back at the address it had in 19.0522, captioned "first working raytracer". <!-- unsure: nothing on the site links to it; most likely it was so an old link kept working --> (Later removed on 21.0328, when the site was rebuilt.)

**The JavaScript post goes live** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-11-01&until=2019-11-01) · merged 19.1101.1007 · v0.4.7
- **[Centered post titles](https://github.com/travis-horton/www/commit/cd9d788)** · merged 19.1101.1007
  New: blog post titles are centered and underlined, on every post and draft. (Later replaced on 21.0328 by the rebuilt site's blog.)
- **[Recaman tab title](https://github.com/travis-horton/www/commit/fb519be)** · merged 19.1101.0958
  Fixed: the Recaman Animation's browser tab started with a lowercase "travis horton". It's capitalized now.
- **[Flip-Flop pt 1 typo](https://github.com/travis-horton/www/commit/10480b6)** · merged 19.1101.0927
  Fixed: "The Flip-Flop is basic building block of all memory" now reads "is the basic building block".
  Try it: open https://www.travish.com/blog/the-flip-flop-1
- **[Flip-Flop pt 2 pulled from the list](https://github.com/travis-horton/www/commit/1be65d0)** · merged 19.1101.0924
  Fixed: seven minutes earlier the blog list had started linking to "The D Flip-Flop, pt 2", but the post still sat in the drafts folder, so the link led nowhere. The line is hidden again.
- **[Flip-Flop pt 2 finished](https://github.com/travis-horton/www/commit/1191356)** · merged 19.1101.0917
  Behind the scenes: you finished the draft of pt 2, with four new step-by-step diagrams of a D flip-flop. It stayed a draft and was never published.
- **[JavaScript post published](https://github.com/travis-horton/www/commit/1191356)** · merged 19.1101.0917
  New: "JavaScript's `this`" moved out of drafts and onto the blog list, dated 19.1018.
  Try it: open https://www.travish.com/blog/js-this
- **[Compiler draft started](https://github.com/travis-horton/www/commit/1191356)** · merged 19.1101.0917
  Behind the scenes: a new draft, "What is a compiler and why do I need it?", which starts from a Rust build error you hit after updating macOS.
- **[Footer links](https://github.com/travis-horton/www/commit/1191356)** · merged 19.1101.0917
  Fixed: the footer's Instagram icon pointed at a mistyped address and went nowhere; it now opens your Instagram. Both social icons now open in a new tab, and the footer text is a little smaller.

## October 2019

**Two new draft posts** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-10-18&until=2019-10-18) · merged 19.1018.1307 · v0.4.6
- **[Draft posts](https://github.com/travis-horton/www/commit/4871f1e)** · merged 19.1018.1246
  Behind the scenes: two new drafts, "Studying DNS" (breaking a web address into its parts) and "JavaScript `this`, `apply`, `call`, and `bind`", plus a blank template for starting new posts. At 13:07 you edited the JavaScript draft ([e0e8264](https://github.com/travis-horton/www/commit/666ee3a)); neither was on the blog list yet.
- **[Journal link changed](https://github.com/travis-horton/www/commit/4871f1e)** · merged 19.1018.1246
  Behind the scenes: the journal switched from a linked copy of its own GitHub project to a shortcut pointing at the folder where your journal lived. The linked Battleship project was moved to a newer version.

## August 2019

**The live copy merged back in** · [merge](https://github.com/travis-horton/www/commit/29a146d) · merged 19.0802.1204 · v0.4.5
- Behind the scenes: brought in a change made on the live copy of the site that took the journal out "for the master branch to be clean". The merge kept the journal, so nothing on the site changed.

**Battleship linked in, and notes on running the site** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-08-02&until=2019-08-02) · merged 19.0802.0957 · v0.4.4
- **[Battleship](https://github.com/travis-horton/www/commit/3aee916)** · merged 19.0802.0957
  Behind the scenes: your separate Battleship project was linked into the site's files as a work in progress. It wasn't listed on any page yet.
- **[Site notes](https://github.com/travis-horton/www/commit/3aee916)** · merged 19.0802.0957
  Behind the scenes: a notes file reminding you how the site is served and how to update it, first written 19.0502.
- **[Tidying](https://github.com/travis-horton/www/commit/3aee916)** · merged 19.0802.0957
  Behind the scenes: removed a stray file named ":w" that a text-editor slip had saved into the portfolio folder on 19.0701. The linked journal was moved to a newer version.

## July 2019

**The journal hooked up, second try** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-07-09&until=2019-07-09) · merged 19.0709.0941 · v0.4.3
- **[Journal link](https://github.com/travis-horton/www/commit/5554106)** · merged 19.0709.0941
  Behind the scenes: over half an hour you reworked how the journal is attached: first fixing its shortcut, then replacing the shortcut with a linked copy of the journal's own GitHub project, removing that, and adding it back. It ended linked to the GitHub project; nothing else on the site changed.
- **[Binary draft](https://github.com/travis-horton/www/commit/fd5f3ab)** · merged 19.0709.0931
  Behind the scenes: a short draft post on why computers use binary. It was never listed on the blog.

**Blog tidying** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-07-04&until=2019-07-04) · merged 19.0704.1020 · v0.4.2
- **[First post spacing](https://github.com/travis-horton/www/commit/83a5ee4)** · merged 19.0704.1020
  Fixed: "The First Blog Post" still had hand-placed blank lines between its paragraphs, doubling the spacing the stylesheet now adds; they're gone. You also tried underlining its title and took the underline back off minutes later ([1fce87a](https://github.com/travis-horton/www/commit/74f2c8d), [70b3791](https://github.com/travis-horton/www/commit/9bc48f8)).
  Try it: open https://www.travish.com/blog/the-first-blog
- **[Flip-Flop pt 2 draft](https://github.com/travis-horton/www/commit/c537403)** · merged 19.0704.0710
  Behind the scenes: the pt 2 draft grew paragraphs explaining NAND gates and how the clock drives a flip-flop, and the blog's pictures moved into the site's shared images folder. Despite the commit message ("does this add my journal?"), nothing about the journal changed.

**A change from the live copy merged in** · [merge](https://github.com/travis-horton/www/commit/329ed03) · merged 19.0704.0802 · v0.4.1
- Behind the scenes: brought in a new headshot that had been swapped in directly on the live copy of the site on 19.0701. Where the two versions disagreed you kept the one you'd been working on, so the only thing actually added was the server's log of errors.

**Flip-Flop pt 1 polished, pt 2 started** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-07-03&until=2019-07-03) · merged 19.0703.1738 · v0.4.0
- **[Flip-Flop pt 1](https://github.com/travis-horton/www/commit/b875116)** · merged 19.0703.1738
  Fixed: "The D Flip-Flop, pt 1" lost its stacked blank lines, got a smaller centered AND-gate diagram, and small wording fixes ("turned in" became "turned into").
  Breaking: it also moved to a new address, so the old one stopped working.
  Try it: open https://www.travish.com/blog/the-flip-flop-1
- **[Flip-Flop pt 2 draft](https://github.com/travis-horton/www/commit/b875116)** · merged 19.0703.1738
  Behind the scenes: started a draft of pt 2 with a diagram of a D flip-flop. Its line on the blog list is there but hidden until the post is done.
- **[Even spacing](https://github.com/travis-horton/www/commit/b875116)** · merged 19.0703.1738
  New: paragraphs and headings get even spacing from the stylesheet instead of hand-placed blank lines, starting with the About page. (Later replaced on 21.0328, when the site was rebuilt.)

**About page rewrite and the first blog posts** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-07-01&until=2019-07-01) · merged 19.0701.1859 · v0.3.0
- **[Job title](https://github.com/travis-horton/www/commit/33d896c)** · merged 19.0701.1859
  New: the About page's heading changed from "Travis Horton, Web Developer" to "Travis Horton, Software Developer".
- **[About page](https://github.com/travis-horton/www/commit/3968940)** · merged 19.0701.1806
  New: the About page got a heading and a new headshot, and the Recurse Center paragraph moved to the top with a link to your portfolio. Your piano background moved to the end. (Later replaced on 21.0328, when the site was rebuilt.)
- **[First blog posts](https://github.com/travis-horton/www/commit/3968940)** · merged 19.0701.1806
  New: the Blog page lists your first two posts, "The First Blog Post" (19.0626) and "The D Flip-Flop, pt 1" (19.0627), and its tab reads "th.blog".
  Try it: open https://www.travish.com/blog
- **[Journal added](https://github.com/travis-horton/www/commit/3968940)** · merged 19.0701.1806
  New: your daily journal was added to the site, as a shortcut pointing at the folder where it lived. The word "I" in the About page's last paragraph became a hidden link to it. (Later removed on 20.0426; the whole About page was replaced on 21.0328.)
- **[Contact and resume](https://github.com/travis-horton/www/commit/3968940)** · merged 19.0701.1806
  Fixed: the resume link pointed at a file that existed only on your own computer, so it couldn't work on the live site; the resume PDF is now part of the site and opens in the browser.
  Breaking: the Contact page also moved to its own address, and the menu's links got shorter addresses.
- **[Styles and a stray file](https://github.com/travis-horton/www/commit/3968940)** · merged 19.0701.1806
  Behind the scenes: new styles for quoted passages and blog pictures. A text-editor slip also saved a stray file named ":w" into the portfolio folder (removed 19.0802).

## June 2019

**Perlin noise, and the About page catches up** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-06-24&until=2019-06-24) · merged 19.0624.1812 · v0.2.2
- **[Perlin Noise Animation](https://github.com/travis-horton/www/commit/57af338)** · merged 19.0624.1812
  New: the Portfolio got a Perlin Noise Animation: a white dot circles over a cloudy grey field of Perlin noise, and a thin bar below shows how light or dark the spot under the dot is.
  Try it: open https://www.travish.com/programming/perlin-noise
- **[About page](https://github.com/travis-horton/www/commit/57af338)** · merged 19.0624.1812
  New: the Recurse Center line now says you attended the Spring 1, 2019 batch (19.0218 to 19.0509) and learned a ton. The "here's my work" link now goes to the Portfolio page, and the mention of an archive of your old piano website was dropped. (Later replaced on 21.0328, when the site was rebuilt.)

**Broken links fixed, new colors, old pieces cleared out** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-06-23&until=2019-06-23) · merged 19.0623.1916 · v0.2.1
- **[Broken links fixed](https://github.com/travis-horton/www/commit/119db82)** · merged 19.0623.1916
  Fixed: links to styles, the menu, and several project pages pointed at places that had moved, so parts of the site came up broken or unstyled. They all point at the right places now, and every page shares one stylesheet.
- **[Old pieces removed](https://github.com/travis-horton/www/commit/119db82)** · merged 19.0623.1916
  Behind the scenes: removed leftover pages no longer listed anywhere: the animations collection (two circle studies, "another thing", a necklace, hexagon dance, moving lines, and a mouse-following creature), a chat app, a two-player Pong the site admitted was broken, and an old copy of the Perlin noise project.
- **[Recaman Animation](https://github.com/travis-horton/www/commit/119db82)** · merged 19.0623.1916
  New: the Recaman Animation, formerly one of the animations, joined the Portfolio list. (Later removed on 21.0328, when the site was rebuilt.)
- **[Page addresses](https://github.com/travis-horton/www/commit/1e3ac16)** · merged 19.0623.1828
  Fixed: since 19.0622 every page looked for its styles and menu inside an extra "www" folder that existed only on your computer. They now look from the site's top level, which you worked out by previewing the site with a simple local web server. <!-- unsure: whether the live site actually showed broken pages during that day -->
- **[New colors](https://github.com/travis-horton/www/commit/1e3ac16)** · merged 19.0623.1828
  New: light grey text on a near-black background with blue accents replaced the old grey, teal and red, and links you've already visited get a wavy underline. (Later replaced on 21.0328, when the site was rebuilt.)
- **[Contact page reorganized](https://github.com/travis-horton/www/commit/1e3ac16)** · merged 19.0623.1828
  New: the Contact page is now four lists: Contact (email, phone number, Twitter, Instagram, LinkedIn), Resume, Projects (GitHub), and Blogs I Follow.
  Try it: open https://www.travish.com/contact
- **[Unfinished projects removed](https://github.com/travis-horton/www/commit/1e3ac16)** · merged 19.0623.1828
  Behind the scenes: removed the unfinished Battleship draft and the "a square of circles" animation, and renamed three project folders (Colorful Life, Ray Tracer, Perlin noise) to one consistent style.

**The site gets its shape: About, Portfolio, Blog, Contact** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-06-22&until=2019-06-22) · merged 19.0622.1910 · v0.2.0
- **[Project pages join the site](https://github.com/travis-horton/www/commit/20e61c2)** · merged 19.0622.1910
  New: the Orbits, Polygon Race and Ray Tracer pages now show the site's menu and footer like every other page. The menu order became About, Portfolio, Blog, Contact, and the little social icons came off the Contact list.
- **[Asteroids restart button](https://github.com/travis-horton/www/commit/1c53ec1)** · merged 19.0622.1859
  New: Asteroids got a restart button. Before, the game-over screen told you to reload the page to play again. (Later replaced: today's Asteroids restarts with the R key.)
- **[Blog page and Portfolio](https://github.com/travis-horton/www/commit/cac00e0)** · merged 19.0622.1826
  New: a Blog page ("This is my blog—there is nothing here yet") with its own menu link, and the Code page was renamed Portfolio. The Contact page was laid out as lists, and pages got your personal tab icon.
  Try it: open https://www.travish.com/blog
- **[Blogs I read](https://github.com/travis-horton/www/commit/f53f2a6)** · merged 19.0622.1506
  New: the Contact page got a list of blogs you read: Jeff Fowler's and Julia Evans's.
  Try it: open https://www.travish.com/contact
- **[Contact page and project list](https://github.com/travis-horton/www/commit/95caa00)** · merged 19.0622.1445
  New: a Contact page with your email, Twitter, Instagram, GitHub, LinkedIn, and a resume download. The Code page became a tidy Portfolio list (Ray Tracer, Asteroids, Orbits, Polygon Race, Game of Life, Colorful Life Exercise), with Orbits and Polygon Race promoted out of the animations. (Later replaced on 21.0328 by the rebuilt site's Programming page.)
- **[New look and menu](https://github.com/travis-horton/www/commit/55509e9)** · merged 19.0622.1310
  New: the whole site switched to the Zilla Slab typeface, and the menu changed from code / home / piano to Code / Bio / Contact. (Later replaced on 21.0328, when the site was rebuilt.)
  Removed: the piano page (a pointer to your old Wix pianist site) and the placeholder blog page were removed, and the site's images and scripts moved into one shared folder.

## May 2019

**The site begins** · [commits](https://github.com/travis-horton/www/commits/main?since=2019-05-22&until=2019-05-22) · merged 19.0522.1548 · v0.1.0
- **[First version of the site](https://github.com/travis-horton/www/commit/375020f)** · merged 19.0522.1541
  New: the first hand-built travish.com: a home page introducing you, your piano training and New York career, your year of part-time programming, and your acceptance to the Recurse Center; a menu of code / home / piano; and a piano page pointing to your old Wix pianist site. Every page shared a footer with a copyright line and Twitter and Instagram icons, and a "404 file not found ¯\\\_(ツ)\_/¯" page caught bad addresses. (Later replaced on 21.0328, when the site was rebuilt.)
- **[The Code page](https://github.com/travis-horton/www/commit/375020f)** · merged 19.0522.1541
  New: a Code page listing what you'd built (a page of animations, Game of Life, a basic ray tracer, Asteroids, and a colorful life exercise), your goals (the Postgres tutorial, learning Rust, Nand2Tetris), and things to build next: an RPG where you roam the internet fighting HTML elements, and a to-do/goals tracker app. It also linked your GitHub and jfo's. (Later replaced on 21.0328 by the rebuilt site's Programming page.)
- **[Unfinished pieces](https://github.com/travis-horton/www/commit/375020f)** · merged 19.0522.1541
  Behind the scenes: the first version also carried pages not yet listed anywhere: a Battleship game in progress, a "square of circles" animation, a chat app, and a two-player Pong marked broken. A placeholder Blog page was there too, not yet holding posts.
- **[Animated tab icon](https://github.com/travis-horton/www/commit/375020f)** · merged 19.0522.1541
  New: pages without their own icon got a tab icon that animates, cycling through eight frames about three times a second.
- **[Perlin noise linked in](https://github.com/travis-horton/www/commit/5038728)** · merged 19.0522.1548
  Behind the scenes: your separate topoCircle project (the Perlin noise animation) was linked into the site's files. It wasn't listed on a page until 19.0624.
