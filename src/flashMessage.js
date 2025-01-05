export function flashMessage(message) {
    const flashMessageElement = document.getElementById("flash-message");
    flashMessageElement.innerText = message;
    flashMessageElement.style.display = "block";
    setTimeout(() => {
        flashMessageElement.style.display = "none";
    }, 3000);
}
