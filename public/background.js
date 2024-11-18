// public/background.js

const trackedProducts = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "reload_tab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.reload(activeTabId);
    });
  }

  if (message === "fetch_and_update") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, "fetch_and_update", (response) => {
        sendResponse(response);
      });
    });
    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }

  if (message === "get_div_content") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, "get_div_content", (response) => {
        sendResponse(response);
      });
    });
    return true; // Indicates asynchronous response
  }

  if (message === "get_dom") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTabId },
          func: () => ({
            title: document.title,
            url: window.location.href,
            html: document.documentElement.outerHTML,
          }),
        },
        (result) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            sendResponse(result[0].result);
          }
        }
      );
    });
    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }

  // Amazon Price Tracking Messages

  if (message.action === "TRACK_PRODUCT") {
    const { url, targetPrice } = message;

    if (trackedProducts[url]) {
      trackedProducts[url].targetPrice = targetPrice;
    } else {
      trackedProducts[url] = { targetPrice, latestPrice: null };
    }

    console.log(`Started tracking ${url} for price drop to ${targetPrice}`);
  }

  if (message.action === "PRICE_FOUND") {
    const url = sender.tab.url;
    const price = message.price;

    // Check if the product is already being tracked
    if (trackedProducts[url]) {
      if (price < trackedProducts[url].targetPrice) {
        // Price drop detected
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon48.png",
          title: "Price Drop Alert!",
          message: `The price for your tracked product has dropped to $${price}.`,
        });
      }
      // Update the latest price
      trackedProducts[url].latestPrice = price;
    }
  }

  if (message.action === "PRODUCT_DETAILS") {
    const url = sender.tab.url;
    const details = message.data;

    // Update the tracked product details
    trackedProducts[url] = {
      ...details,
      latestPrice: details.price,
    };
  }
});

// Price Tracking

// Set up alarm to periodically check prices
chrome.alarms.create("priceCheck", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "priceCheck") {
    // Trigger a price check
    chrome.tabs.query({ url: "*://www.amazon.in/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      });
    });
  }
});

// to redirect to any url
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   // Redirect the current tab to google.com
//   chrome.tabs.update(tabs[0].id, { url: "https://www.google.com" });
// });

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   // Inject the content script into the current tab
//   chrome.scripting.executeScript({
//     target: { tabId: tabs[0].id },
//     files: ["content.js"],
//   });
// });

// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     console.log(details, "details");
//     if (details.url.includes("P8GwlRgVaLhfMMMp11bRvu2Hd+hvlMvucjvjc2D0wOs")) {
//       return { cancel: true }; // Block requests to 'ads.example.com'
//     }
//   },
//   { urls: ["<all_urls>"] }
// );

// chrome.notifications.create({
//   type: "basic",
//   iconUrl: "icon.png",
//   title: "Notification Title",
//   message: "Notification message content.",
// });

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log("Request made to:", details.url);
    // You can also analyze or filter requests here if needed
  },
  { urls: ["<all_urls>"] }
);
