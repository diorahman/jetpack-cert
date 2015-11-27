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
                console.log('request is not Ci.nsIChannel');
                return;
            }
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
                console.log('certificate: ');
                console.log(certificate);
                console.log('**');
            }
        }
    }
}

tabs.on('activate', tab => {
    const lowLevel = viewFor(tab);
    const browser = getBrowserForTab(lowLevel);
    browser.addProgressListener(progressListener);
});
