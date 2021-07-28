import React from 'react';

const JsThisBlog = () =>
  <div className="container">
    <main className="content">
      <div className="main">
        <h1 className="blog_title">Javascript's <code>this</code>, <code>apply</code>, <code>call</code>, and <code>bind</code></h1>
        <p>From MDN: <blockquote><code>this</code>: A property of an execution context (global, function or eval) that, in non–strict mode, is always a reference to an object and in strict mode can be any value.</blockquote></p>
        <p>Yeah, what the hell does that mean. Let's walk through it, starting with the stuff I already understand.</p>
        <p>An object! I know what that is. So <code>this</code> is always a reference to an object. Which object? I guess we'll get to that.</p>
        <p>A property: basically a variable associated with the thing.</p>
        <p>Strict vs non-strict modes. Well, I haven't really done anything in strict mode, but from what I understand it makes you be more explicit about your code. That sort of makes sense in context here: you have to declare exactly what <code>this</code> is when you're in strict mode, whereas non-strict mode JavaScript will try to figure out what you mean.</p>
        <p>And then, execution context. ?? At least this definition gives us a nice hint with "(global, function, or eval)". So I'm gonna go with: a context for executing. Sounds reasonable. Executing...like an executable (.exe file).</p>
        <p>More from MDN: <blockquote>In the global execution context (outside of any function), this refers to the global object whether in strict mode or not.</blockquote></p>
        <p>Alright. So when you're in the global scope, <code>this</code> is just the global object (<code>window</code> in the DOM).</p>
        <code>
          <p>this.b = 37;</p>
          <p>console.log(window.b); // 37</p>
          <p>console.log(b); // 37</p>
        </code>
        <p>And one more quote from MDN: <blockquote>Inside a function, the value of this depends on how the function is called.</blockquote></p>
        <p>From here on I'll be referencing this <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this">MDN article</a>, but not quoting it directly and leaving out its treatment of strict mode.</p>
        <p><h3>A simple function call:</h3> <code>this</code> is just the global object (<code>window</code> in the DOM).</p>
        <p>However, JS has three ways to change this behavior: <code>call</code>, <code>apply</code>, and <code>bind</code>. <code>bind</code> was added in ES5. These three each affect <code>this</code> in different ways:</p>
        <p><h4><code>call</code> and <code>apply</code>:</h4>From a cursory search of the internet, the difference between these two seems purely syntactical: they both allow you to assign a specific object to the local <code>this</code> when calling a function.</p>
        <p><code>apply</code> takes up to two parameters: <code>.apply(this, [...])</code>, which is to say the first is the <code>this</code> you want to reference within the function call, and an <b>a</b>rray with arguments you pass to the function itself.</p>
        <p><code>call</code> takes zero or more parameters, seperated by the standard <b>c</b>ommas: <code>.call(this, param1, param2...)</code>. The 2nd and following parameters are the arguments that get passed to the function itself. (The little pnemonic device the internet suggested to remember the difference between <code>apply</code> and <code>call</code>: <code>call</code> &#x2192; comma, <code>apply</code> &#x2192; array).</p>
        <p><h3><code>bind</code>:</h3>A different beast: <code>bind</code> is a built-in function.prototype method that creates a new function from (1) the called function and (2) a given object that <code>bind</code>'s itself to the new function as the new function's <code>this</code>.</p>
        <p><h3>Arrow functions:</h3>In ES6 <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions">Arrow functions</a> were introduced. They are worthy of <a href="https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/">several</a> <a href="https://stackabuse.com/arrow-functions-in-javascript/">different</a> <a href="https://developer.blog/es6-arrow-functions/">articles</a> in themselves. For the purposes of these notes, the important thing to remember is that <code>this</code> retains the value it had within whatever called the arrow function. This functionality can be useful for using helper functions within other functions, for class constructions, and other fun things too.</p>
        <p><h3>Other cases</h3>There are essentially three other cases where <code>this</code> has different functionality: <ol><li>objects: <code>this</code> is the object</li><li>constructors: <code>this</code> is the new object being created</li><li>and event handlers: <code>this</code> is the element that fired the event</li></ol>The <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this">MDN Docs</a> go into much more detail about those three cases.</p>
      </div>
    </main>
  </div>;

export default JsThisBlog;
