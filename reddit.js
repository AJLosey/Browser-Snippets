{
    const reactRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.getFiberRoots(1).values().next().value.current;
    let node = reactRoot;
    while (true) {
        if (node.memoizedProps?.store) break;
        node = node.child;
    }
    const { store } = node.memoizedProps;
    window.redditStore = store;

    function onChangeState(store, callback) {
        let state = store.getState();
        store.subscribe(() => {
            const currentState = state;
            const nextState = store.getState();
            state = nextState;
            callback(currentState, nextState);
        });
    }

    const getStorageKey = (draftId) => `ajlosey-reddit-draft-note-${draftId}`;

    function onDraftPost(draftID) {
        const importantContainer = document.querySelector(".ListingLayout-backgroundContainer").nextElementSibling.lastElementChild.firstElementChild;
        if (importantContainer.lastElementChild.id === 'note-container') return;


        const noteContainer = document.createElement("div");
        noteContainer.id = "note-container";
        const noteInput = document.createElement("input");
        noteInput.type = "text";
        noteInput.style = "width: 100%; background-color: black; border-color: rgb(215, 218, 220); border-width: 1px; border-style: solid; color: white;";

        const storedValue = localStorage.getItem(getStorageKey(draftID));
        noteInput.value = storedValue;

        noteContainer.appendChild(noteInput);
        importantContainer.appendChild(noteContainer);
        noteInput.addEventListener("change", (ev) => {
            const value = ev.target.value.trim();
            if (!value) {
                localStorage.removeItem(getStorageKey(draftID));
            } else {
                localStorage.setItem(getStorageKey(draftID), value);
            }
        });
    }

    function onSetUrl() {
        console.log('page location: ', location)
        const pageURL = new URL(window.location);
        const draftID = pageURL.searchParams.get("draft");
        if (draftID) {
            onDraftPost(draftID);
        }
        // if (location.pathname.endsWith('/submit')) {

        // }
    }

    const queue = [];
    onChangeState(store, (prev, next) => {
        const { currentPage: prevPage, metas: prevMetas } = prev.platform;
        const { currentPage: nextPage, metas: nextMetas } = next.platform;
        if (nextPage.url !== prevPage.url) queue.push(onSetUrl);
        if (prevMetas !== nextMetas) queue.pop()();
    });

    onSetUrl();
}

