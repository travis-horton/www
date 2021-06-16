import aboutIcon from 'url:/src/assets/media/info-icon.svg';
import keyboardIcon from 'url:/src/assets/media/keyboard-icon.svg';
import pianoIcon from 'url:/src/assets/media/piano-icon.svg';
import blogIcon from 'url:/src/assets/media/blog-icon.svg';
import contactIcon from 'url:/src/assets/media/contact-icon.svg';

const pages = [
  {
    name: 'about me',
    icon: aboutIcon,
    path: '/',
  },
  {
    name: 'software engineer',
    icon: keyboardIcon,
    path: '/programming',
  },
  {
    name: 'pianist',
    icon: pianoIcon,
    path: '/piano',
  },
  {
    name: 'blog',
    icon: blogIcon,
    path: '/blog',
  },
  {
    name: 'contact',
    icon: contactIcon,
    path: '/contact',
  },
];

export { pages };
