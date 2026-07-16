window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "4b75140a-e41f-40c1-8181-32ee5635f953",
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerPath: "OneSignalSDKWorker.js",
    serviceWorkerParam: {
      scope: "/CODM.TestServer.DL.Link/"
    },
    notifyButton: {
      enable: true,
      showOnMobile: true,
      size: 'medium',
      theme: 'dark',
      position: 'bottom-right',
      text: {
        'tip.state.unsubscribed': 'Get Test Build Alerts',
        'tip.state.subscribed': "You're all set!",
        'dialog.main.title': 'Public Test Build Updates',
        'dialog.main.button.subscribe': 'NOTIFY ME',
        'dialog.main.button.unsubscribe': 'STOP ALERTS'
      }
    }
  });
});
