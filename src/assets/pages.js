import aboutIcon from 'url:../media/info-icon.svg';
import keyboardIcon from 'url:../media/keyboard-icon.svg';
import pianoIcon from 'url:../media/piano-icon.svg';
import blogIcon from 'url:../media/blog-icon.svg';
import contactIcon from 'url:../media/contact-icon.svg';

const pages = [
  {
    name: 'about me',
    icon: aboutIcon,
    path: '/home',
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
