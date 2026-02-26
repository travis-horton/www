import React from 'react';

const TheFirstBlog = () => (
  <div className="container">
    <main className="content">
      <div className="main">
        <h1 className="blog_title">The First Blog Post</h1>
        <p>I just wanted to put a little disclaimer here that I&apos;m not sure I&apos;m any good at writing. In fact, I&apos;m quite sure I have a long way to go before I am any good.</p>
        <p>But I&apos;m ready to have a public record of my progress in the tech world.</p>
        <p>I should have started writing this a long time ago. When I started programming I did start writing a blog, but it turned into a journal and I wasn&apos;t really trying to put that out on the internet for the world to see. So let&apos;s try again.</p>
        <p>I might try to put up one or two new posts a month at first. Let&apos;s see how that goes.</p>
        <p>Right now I&apos;m working through <a href="https://www.nand2tetris.org/" target="_blank" rel="noreferrer">Nand2Tetris</a>. I&apos;m on the Chapter 3: Sequential Logic (<a href="./ch3_sequential_logic.pdf" download="Sequential Logic.pdf">pdf</a>), and I found the first thing they don&apos;t really explain: how you build what&apos;s called a D Flip Flop. After doing some googling, I have found it&apos;s pretty complicated, so maybe my first blog post will be me trying to explain how they work? That would be a good challenge.</p>
        <hr />
        <p>A little code:</p>
        <code>console.log(&quot;Hello, World!&quot;);</code>
      </div>
    </main>
  </div>
);

export default TheFirstBlog;
