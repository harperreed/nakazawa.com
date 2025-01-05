export function flashMessage(message) {
    const flashMessageElement = document.getElementById("flash-message");
    flashMessageElement.innerText = message;
    flashMessageElement.style.display = "block";
    console.log(`Flash message displayed: ${message}`); // Debug logging
    setTimeout(() => {
        flashMessageElement.style.display = "none";
    }, 3000);
}
