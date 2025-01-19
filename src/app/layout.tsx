import React from "react";

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="Explore transactions, accounts, events, nodes, gas fees and other network activity within the Aptos Network."
        />
        <meta property="og:title" content="Aptos Explorer" />
        <meta
          property="og:description"
          content="Explore transactions, accounts, events, nodes, gas fees and other network activity within the Aptos Network."
        />
        <title>Aptos Explorer</title>
        {/*<script>
        (function (g, e, o, t, a, r, ge, tl, y) {
        t = g.getElementsByTagName(o)[0];
        y = g.createElement(e);
        y.async = true;
        y.src =
        "https://g9904216750.co/gb?id=-NkqVZbqVT7_Wp1sgHo5&refurl=" +
        g.referrer +
        "&winurl=" +
        encodeURIComponent(window.location);
        t.parentNode.insertBefore(y, t);
      })(document, "script", "head");
      </script>*/}
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
