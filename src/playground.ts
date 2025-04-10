
function getQueryParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function decodeBase64(base64: string): string {
  try {
    return decodeURIComponent(atob(base64));
  } catch (e) {
    console.error("Failed to decode base64 string:", e);
    return "";
  }
}

function encodeBase64(text: string): string {
  return btoa(encodeURIComponent(text));
}

export function fillFromQueryParams(id: string) {
  // Get query parameters
  const param = getQueryParam(id);
  console.log(param)
  
  // Find the elements
  const element = document.getElementById(id);
  console.log(element.textContent)
  
  // Fill playground if parameter exists and element exists
  if (param && element) {
    const decodedContent = decodeBase64(param);
    console.log(decodedContent)
    element.textContent = decodedContent;
  }  
}


// Function to copy the shareable URL to clipboard
function copyLinkToClipboard() {
    let url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Error copying text: ', err);
    });
  }
