const tabs = require('sdk/tabs');

const {viewFor} = require('sdk/view/core');
const {modelFor} = require('sdk/model/core');
const {getBrowserForTab, getTabForContentWindow} = require('sdk/tabs/utils');
const {Ci, Cu} = require('chrome');
Cu.import('resource://gre/modules/XPCOMUtils.jsm', this);

let progressListener = {
    QueryInterface: XPCOMUtils.generateQI([
        Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference
    ]),
    onLocationChange: () => {

    },
    onSecurityChange: (aWebProgress, aRequest, aState) => {

        if (aState & Ci.nsIWebProgressListener.STATE_IS_SECURE) {

            if (!aRequest instanceof Ci.nsIChannel) {
                console.log('request is not nsIChannel');
                return;
            }

            var highLevel = modelFor(getTabForContentWindow(aWebProgress.DOMWindow));

            const securityInfo = aRequest.securityInfo;
            if (!securityInfo) {
                console.log('no security info');
            }
            if (aRequest instanceof Ci.nsIChannel
                && securityInfo instanceof Ci.nsITransportSecurityInfo
                && securityInfo instanceof Ci.nsISSLStatusProvider)
            {
                const provider = securityInfo.QueryInterface(Ci.nsISSLStatusProvider);
                const certificate = provider.SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;

                console.log('tab: ');
                console.log(highLevel.id);
                console.log('certificate: ');
                console.log(certificate);
            }
            return;
        }

        console.log('INSECURE!');

        // handle insecure or broken connection
    }
}

tabs.on('activate', tab => {
    console.log('id: ', tab.id);
    const lowLevel = viewFor(tab);
    let browser = getBrowserForTab(lowLevel);

    // maintain browser
    if (!tab.listener) {
        browser.addProgressListener(progressListener);
        tab.listener = true;
    }
});
