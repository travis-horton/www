import React from 'react';
import aboutIcon from 'url:~/src/media/info-icon.svg';
import keyboardIcon from 'url:~/src/media/keyboard-icon.svg';
import pianoIcon from 'url:~/src/media/piano-icon.svg';
import blogIcon from 'url:~/src/media/blog-icon.svg';
import contactIcon from 'url:~/src/media/contact-icon.svg';

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

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: window.location.pathname,
    };
  }

  render() {
    const { selectedTab } = this.state;

    return (
      <header>
        <nav>
          {/*
            <a href="">what i do</a>
            <a href="">who i am</a>
            <a href="">things i like</a>
          */}
          {
            pages.map((page) => {
              let isSelectedTab = false;
              if (page.path === selectedTab || `${page.path}/` === selectedTab) {
                isSelectedTab = true;
              }

              return (
                <a
                  key={page.name}
                  to={page.path}
                  onClick={() => this.setState({ selectedTab: page.path })}
                >
                  <span>{page.name}</span>
                  <img src={page.icon} alt={page.name} />
                </a>
              );
            })
          }
        </nav>
      </header>
    );
  }
}

export default Header;
