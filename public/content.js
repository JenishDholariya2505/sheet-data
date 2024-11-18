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
