"use strict";

function on_click(info, tab){
	var url='https://iqdb.org/?url='+encodeURIComponent(info.srcUrl);
	chrome.tabs.create({url});
}

chrome.contextMenus.create({
	type:'normal',
	//id:'download_image',
	title:'search by iqdb',
	contexts:['image'],
	onclick:on_click
});

var setHookForReferer = function() {
    var filter = {
        urls: ["*://*.pixiv.net/*", "*://*.pximg.net/*"],
        types: ["other"]
    };
    var options = ["blocking", "requestHeaders"];
    chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
        if (details.url.match(/img\-original/)) {
            details.requestHeaders.push({
                name: "Referer",
                value: "http://www.pixiv.net/member_illust.php"
            });
        }
        return {requestHeaders: details.requestHeaders};
    }, filter, options);
};
setHookForReferer();
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var type=request.type;
  switch (type){
    case "download_img":

      chrome.downloads.download({
        url:request.url,
        
        conflictAction: "prompt"
      });
      break;
    default:
      break;
  }

});
