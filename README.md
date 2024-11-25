<h1>The Trading Sandbox</h1>
<br />
<h2>Requirements: </h2>
<ul>
  <li>Browser that Runs ECMA 6+ JavaScript, Vanilla HTML, and Vanilla CSS</li>
  <li>Lightweight Charts (Already Installed In Project)</li>
</ul>
<br />
<h2>Introduction: </h2>
<br />
<p>The Trading Sandbox is a simple to use web application developed to simulate a candlestick chart of an asset in order to allow users to practice their trading skills. The app overall is extremely lightweight and can run on ordinary web browsers (Even in offline situations).</p>
<br/>
<h2>Demo: </h2>
<p>For a quick demo, go on this link: <a href="https://danielhyuncoder.github.io/The-Trading-Sandbox/dashboard.html">Demo Link</a></p></p>
<br/>
<h2>Start: </h2>
<p>First install the whole folder and for usage, go on dashboard.html on a web browser. For editing purposes, go within main.js, where it houses a majority of the JavaScript running the simulation.</p>
<br/>
<h2>Price Simulation Formulas: </h2>
<h3>Next High Price Formula: open + (lastClose*(Math.random() * volatility_index))</h3>
<h3>Next Low Price Formula: open + (lastClose*(Math.random() * volatility_index))</h3>
<h3>Next Close Price Formula: low + (Math.random() * (high - low))</h3>
