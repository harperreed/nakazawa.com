export function flashMessage(clickCount, messages) {
    const container = document.getElementById("flash-messages-container") || createMessagesContainer();
    const messageObj = messages.find((msg) => msg.clicks === clickCount);

    if (messageObj) {
        const messageElement = document.createElement("div");
        messageElement.className = "flash-message";
        messageElement.innerText = messageObj.message;
        container.appendChild(messageElement);
        
        // Fade in
        messageElement.style.opacity = "0";
        requestAnimationFrame(() => {
            messageElement.style.display = "block";
            messageElement.style.transition = "opacity 0.3s ease-in-out";
            messageElement.style.opacity = "1";
        });

        // Fade out after delay
        setTimeout(() => {
            messageElement.style.opacity = "0";
            setTimeout(() => {
                messageElement.remove();
                // Remove container if empty
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, 2700);
    }
}

function createMessagesContainer() {
    const container = document.createElement("div");
    container.id = "flash-messages-container";
    document.body.appendChild(container);
    return container;
}
