export function flashMessage(clickCount, messages) {
    const flashMessageElement = document.getElementById("flash-message");
    const messageObj = messages.find(msg => msg.clicks === clickCount);
    
    if (messageObj) {
        flashMessageElement.innerText = messageObj.message;
        flashMessageElement.style.display = "block";
        console.log(`Flash message displayed: ${messageObj.message}`); // Debug logging
        setTimeout(() => {
            flashMessageElement.style.display = "none";
        }, 3000);
    }
}
