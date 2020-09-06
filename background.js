"use strict";

function on_click(info, tab) {
    var url = 'https://iqdb.org/?url=' + encodeURIComponent(info.srcUrl);
    chrome.tabs.create({
        url
    });
}

chrome.contextMenus.create({
    type: 'normal',
    //id:'download_image',
    title: 'search by iqdb',
    contexts: ['image'],
    onclick: on_click
});

var map = new Map();

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
suggest({filename: map.get(item.id),
conflictAction: "prompt"});
map.delete(item.id);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var type = request.type;
    switch (type) {
        case "download_img":
            var a = document.createElement('a');
            a.href = request.url;

            if (request.forceDownload || a.protocol === 'blob:') {
                // No workaround needed or the XHR workaround is giving
                // us its results.
                chrome.downloads.download({
                    url: request.url,
                    filename: request.filename,
                    conflictAction: "prompt"
                },function(downloadId) {
                    map.set(downloadId,request.filename);
                });

                if (a.protocol === 'blob:') {
                    // We don't need the blob URL any more. Release it.
                    URL.revokeObjectURL(request.url);
                }
            } else {
                // The XHR workaround is needed. Inform the tab.
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'xhr-download',
                    url: request.url
                });
            }
            break;
        case "test_marked":
            fetch('https://www.pixiv.net/artworks/' + request.id).then(function(response) {
                response.text().then(function(text) {
                    var bookmark = text.match(request.id +
                        "\":(.*)\"bookmarkData\":(.*),");
                    if (bookmark[2].substring(0, 4) != 'null') {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            action: 'xhr-marked' + request.id
                        });
                    }

                });
            }).catch(error => console.error('Error:', error));

            break;
        case "test_followed":
            fetch('https://www.pixiv.net/member.php\\?id=' + request.id).then(function(response) {
                response.text().then(function(text) {
                    var isFollowed = text.match("\"isFollowed\":(.*),\"");
                    if (isFollowed[1].substring(0, 4) == 'true') {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            action: 'xhr-followed' + request.id
                        });
                    }

                });
            }).catch(error => console.error('Error:', error));

            break;
        default:
            break;
    }

});