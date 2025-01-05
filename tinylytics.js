(function() {
    var endpoint = 'https://tinylytics.app';
    var siteId = 'YOUR_SITE_ID'; // Replace with your actual site ID

    function sendEvent(event) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint + '/api/event', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            siteId: siteId,
            event: event,
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        }));
    }

    document.addEventListener('DOMContentLoaded', function() {
        sendEvent('pageview');
    });

    document.addEventListener('click', function() {
        sendEvent('click');
    });
})();
