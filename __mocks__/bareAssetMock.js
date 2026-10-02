// What Parcel 2 actually hands you for an image imported WITHOUT the `url:`
// scheme (`import icon from './icon.svg'`): an empty object, not a URL.
// Rendered as <img src={icon}>, React stringifies it to "[object Object]".
//
// This mock used to be fileMock's string stub, so tests saw a URL-shaped
// string where production saw `{}` — which is how five broken nav icons
// shipped behind a green suite. Import images with `url:` (see Footer);
// those map to fileMock and get a real string.
//
// It also stands in for a bare pdf or font import. There Parcel does not hand
// back `{}`: it fails the build ("No transformers found"). A mock cannot fail
// a build, so `{}` is the nearest it can get — a test that checks the href or
// src still goes red on "[object Object]". The fix is the same: `url:`.
module.exports = {};
