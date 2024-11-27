// public/content.js

// This script runs on Amazon product pages
function getPrice() {
  // Attempt to select the price element (may vary based on the Amazon layout)
  const priceElement = document.querySelector(
    "#priceblock_ourprice, #priceblock_dealprice"
  );
  if (priceElement) {
    return parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ""));
  }
  return null;
}

// Send the price to the background script
const price = getPrice();
if (price) {
  chrome.runtime.sendMessage({ action: "PRICE_FOUND", price: price });
}

// Extract product details from the Amazon page
function getProductDetails() {
  // Selectors may vary depending on the Amazon product page layout
  const priceElement = document.querySelector(".a-price-whole");
  const imageElement = document.querySelector("#imgTagWrapperId img");
  const titleElement = document.querySelector("#productTitle");
  const descriptionElement = document.querySelector(
    "#productFactsDesktopExpander"
  );

  const price = priceElement ? priceElement.textContent.trim() : null;
  const imageUrl = imageElement ? imageElement.src : null;
  const title = titleElement
    ? titleElement.textContent.trim()
    : "No title found";
  const description = descriptionElement
    ? descriptionElement.textContent.trim()
    : "No description available";

  return {
    price: price,
    imageUrl: imageUrl,
    title: title,
    description: description,
  };
}

try {
  // Send the extracted product details to the background script
  const productDetails = getProductDetails();

  if (productDetails) {
    chrome.runtime.sendMessage({
      action: "PRODUCT_DETAILS",
      data: productDetails,
    });
  }
} catch (error) {
  console.error("Error extracting product details:", error);
}

// Function to log URL and element details
// function logPageDetails() {
//   // Log the current page URL
//   console.log("Current Page URL:", window.location.href);

//   // Find elements with the class name 'a-button-input'
//   const elements = document.getElementsByClassName("a-button-input");

//   // Log details of found elements
//   Array.from(elements).forEach((element, index) => {
//     console.log(`Element ${index + 1} with class 'a-button-input':`, element);
//   });
// }

// Click the button if it exists
// const button = document.getElementById("add-to-cart-button");

// if (button) {
//   button.click();

//   // Wait for navigation to complete and then execute logPageDetails
//   setTimeout(logPageDetails, 3000); // Adjust timeout as needed
// } else {
//   console.log('Element with ID "add-to-cart-button" not found.');
//   // Wait for navigation to complete and then execute logPageDetails
//   setTimeout(logPageDetails, 5000); // Adjust timeout as needed
// }

// Example: Get page title and a specific DOM element
const pageTitle = document.title;
const specificElement = document.querySelector("#elementId"); // Replace with your selector

// Send data back to the background script or log it
chrome.runtime.sendMessage({
  type: "DOM_DATA",
  title: pageTitle,
  elementText: specificElement
    ? specificElement.innerText
    : "Element not found",
});

// Example of extracting some data from the DOM
// Extract some data from the DOM (example: page title)
const extractedData = document;

// Send data back to the background script
chrome.runtime.sendMessage({ type: "EXTRACTED_DATA", data: extractedData });

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateReactDOM") {
    // Find your React app's root element
    const rootElement = document.getElementById("root"); // or other React root ID
    if (rootElement) {
      // Trigger a DOM update or call your React component's state update
      const event = new CustomEvent("updateReactState", {
        detail: message.data,
      });
      rootElement.dispatchEvent(event); // Dispatch event to update the React state
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHANGE_TAB_URL") {
    const pageData = {
      title: document.title,
      body: document.body.innerText,
      url: window.location.href,
    };

    sendResponse(pageData);
  }
  return true; // Keeps the message channel open for async response
});

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_DOM") {
    // Extract data from the DOM
    const domData = {
      title: document.title,
      bodyText: document.body.innerText,
      url: window.location.href,
    };

    // Send data to the React app
    window.postMessage(
      {
        type: "FROM_EXTENSION",
        payload: domData,
      },
      window.origin
    ); // Ensure to send data to the current window
  }
});

// content.js
const currentTabDOM = document.documentElement; // Accessing the DOM

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getDOM") {
    sendResponse({ dom: document.body.innerHTML });
  }
});
