const grooveScribeMessages = {
    const iframe = document.querySelector('iframe');
    if (!iframe) {
        return;
    }
    // Send GIC data used for initialisation
    iframe.addEventListener('message', messageHandler);

    return () => {
        // eslint-disable-next-line @repo/internal/dom-events/no-unsafe-event-listeners
        window.removeEventListener('message', messageHandler);
    };
};
