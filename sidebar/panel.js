var myWindowId;
const frame = document.querySelector('#frame');

/*
Update the sidebar's content.

1) Get the active tab in this sidebar's window.
2) Get its stored content.
3) Put it in the content box.
*/
function updateContent() {
  browser.tabs.query({windowId: myWindowId, active: true})
    .then((tabs) => {
      frame.setAttribute("src",tabs[0].url);
      return browser.storage.local.get(tabs[0].url);
    })
    .then((storedInfo) => {
      // contentBox.textContent = storedInfo[Object.keys(storedInfo)[0]];
    });
}

/*
Update content when a new tab becomes active.
*/
browser.tabs.onActivated.addListener(updateContent);

/*
Update content when a new page is loaded into a tab.
*/
browser.tabs.onUpdated.addListener(updateContent);

/*
When the sidebar loads, get the ID of its window,
and update its content.
*/
browser.windows.getCurrent({populate: true}).then((windowInfo) => {
  myWindowId = windowInfo.id;
  updateContent();
});


let { Cc, Ci } = require('chrome');

let myObserverXFrame =
{
    observe : function (aSubject, aTopic, aData)
    {
            let channel = aSubject.QueryInterface(Ci.nsIHttpChannel);
            try
            { // getResponseHeader will throw if the header isn't set

                let hasXFO = channel.getResponseHeader('X-Frame-Options');

                if (hasXFO)
                {
                    // Header found, disable it
                    channel.setResponseHeader('X-Frame-Options', '', false);
                }
            }
            catch (e) {}
        }
}

var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

observerService.addObserver(myObserverXFrame, "http-on-examine-response", false);
observerService.addObserver(myObserverXFrame, "http-on-examine-cached-response", false);

exports.onUnload = function (reason) {
  if(reason == 'uninstall' || reason == 'disable') {
      observerService.removeObserver(myObserverXFrame, "http-on-examine-response");
      observerService.removeObserver(myObserverXFrame, "http-on-examine-cached-response");
  }
};