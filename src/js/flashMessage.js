export function flashMessage(clickCount, messages) {
    const container = document.getElementById("flash-messages-container") || createMessagesContainer();
    const messageObj = messages.find((msg) => msg.clicks === clickCount);

    if (messageObj) {
        const messageElement = document.createElement("div");
        messageElement.className = "flash-message";
        messageElement.innerText = messageObj.message;
        container.appendChild(messageElement);
        
        // Adjust positions of existing messages
        const existingMessages = container.getElementsByClassName("flash-message");
        let totalHeight = 0;
        for (let i = 0; i < existingMessages.length - 1; i++) {
            const msg = existingMessages[i];
            msg.style.transform = `translateY(${totalHeight}px)`;
            totalHeight += msg.offsetHeight + 5; // 5px for margin
        }
        
        // Position and fade in new message
        messageElement.style.opacity = "0";
        requestAnimationFrame(() => {
            messageElement.style.display = "block";
            messageElement.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
            messageElement.style.opacity = "1";
            messageElement.style.transform = `translateY(${totalHeight}px)`;
        });

        // Fade out after delay
        setTimeout(() => {
            messageElement.style.opacity = "0";
            setTimeout(() => {
                messageElement.remove();
                // Readjust positions of remaining messages
                const remainingMessages = container.getElementsByClassName("flash-message");
                let newTotalHeight = 0;
                for (let i = 0; i < remainingMessages.length; i++) {
                    const msg = remainingMessages[i];
                    msg.style.transform = `translateY(${newTotalHeight}px)`;
                    newTotalHeight += msg.offsetHeight + 5;
                }
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
