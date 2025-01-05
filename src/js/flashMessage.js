export function flashMessage(clickCount, messages) {
    const flashMessageElement = document.getElementById("flash-message");
    const messageObj = messages.find((msg) => msg.clicks === clickCount);

    if (messageObj && flashMessageElement.style.display !== "block") {
        flashMessageElement.innerText = messageObj.message;
        flashMessageElement.style.display = "block";
        
        // Fade in
        flashMessageElement.style.opacity = "0";
        requestAnimationFrame(() => {
            flashMessageElement.style.transition = "opacity 0.3s ease-in-out";
            flashMessageElement.style.opacity = "1";
        });

        // Fade out after delay
        setTimeout(() => {
            flashMessageElement.style.opacity = "0";
            setTimeout(() => {
                flashMessageElement.style.display = "none";
                flashMessageElement.style.transition = "";
            }, 300);
        }, 2700);
    }
}
