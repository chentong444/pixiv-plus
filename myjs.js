'use strict';

function SetCSS() {
    var css_rule_text =
        'Button {padding:0; margin:0;width:100px; height:100px;filter: opacity(20%)}',
        pa = document.querySelector('head'),
        css_style = document.createElement('style'),
        css_rule = document.createTextNode(css_rule_text);
    css_style.type = 'text/css';
    css_style.className = 'mycss-rule';
    css_style.appendChild(css_rule);
    pa.appendChild(css_style);
}

function ChangeSize(img, is_first) {
    var image_size_types = {
        'full': 'fit-height',
        'fit-height': 'fit-width',
        'fit-width': 'full'
    };
    var saved_image_size = localStorage['pixiv_plus_saved_image_size'];
    var image_size = (image_size_types[saved_image_size]) ? (image_size_types[saved_image_size]) :
        'full';
    image_size = is_first ? saved_image_size : image_size;
    switch (image_size) {
        case 'full':
            img.style.maxHeight = "none";
            img.style.maxWidth = "none";
            break;
        case 'fit-height':
            img.style.maxHeight = window.innerHeight + "px";
            img.style.maxWidth = "none";
            break;
        case 'fit-width':
            img.style.maxHeight = "none";
            img.style.maxWidth = window.innerWidth + "px";
            break;
    }
    localStorage['pixiv_plus_saved_image_size'] = image_size;
}

// function get_img_filename(img_url){
//  var img_filename=
// }

function SetButton(button_position, color) {
    var buttonContainer = document.createElement("div");
    buttonContainer.style.textAlign = 'center';
    buttonContainer.style.zIndex = 100;
    buttonContainer.style.width = '300px';
    buttonContainer.style.position = 'relative';
    //buttonContainer.style.top = document.body.clientHeight + 'px';
    buttonContainer.style.left = (document.body.clientWidth / 2 - 150).toString() + 'px';

    var download_button = document.createElement("button");
    var close_button = document.createElement("button");

    download_button.style.backgroundColor = color;
    close_button.style.backgroundColor = color
    //var download_filename=get_img_filename(download_url);

    download_button.className = 'download_btn';
    download_button.onmouseover = function() {
        download_button.style.filter = "opacity(80%)";
    };
    download_button.onmouseout = function() {
        download_button.style.filter = "opacity(20%)";
    };
    download_button.addEventListener("click", function() {
        var img = button_position.getElementsByTagName("img")[0];
        var download_url = img.src;
        chrome.runtime.sendMessage({
            type: "download_img",
            url: download_url,
            forceDownload: false

            //filename:download_filename;
        });
        event.stopPropagation();
        event.preventDefault();
    });

    var download_bgImage = document.createElement("img");
    var download_bgimg = chrome.extension.getURL("images/download.png");
    download_bgImage.src = download_bgimg;
    download_bgImage.draggable = false;
    download_bgImage.style.height = '90px';
    download_button.appendChild(download_bgImage);

    buttonContainer.appendChild(download_button);

    close_button.className = 'close_btn';
    close_button.onmouseover = function() {
        close_button.style.filter = "opacity(80%)";
    };
    close_button.onmouseout = function() {
        close_button.style.filter = "opacity(20%)";
    };
    close_button.addEventListener("click", function() {
        //(window.open('', '_self')).close();
        open(location, '_self').close();
    });

    var close_bgImage = document.createElement("img");
    var close_bgimg = chrome.extension.getURL("images/close.png");
    close_bgImage.src = close_bgimg;
    close_bgImage.draggable = false;
    close_bgImage.style.height = '90px';
    close_button.appendChild(close_bgImage);

    buttonContainer.appendChild(close_button);

    button_position.appendChild(buttonContainer);
    //obser.disconnect();
}

function AddEvent(event, img) {
    switch (event.keyCode) {
        case 81:
            ChangeSize(img, 0);
            break;

    }
}

function colorMaked(id, worksbody) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case 'xhr-marked' + id:
                worksbody.style.backgroundColor = "#FFC0CB";
                break;
        }
    });
    chrome.runtime.sendMessage({
        type: "test_marked",
        id: id,
    });
}

function colorFollowed(id, body) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case 'xhr-followed' + id:
                body.style.backgroundColor = "#87CEFA";
                break;
        }
    });
    chrome.runtime.sendMessage({
        type: "test_followed",
        id: id,
    });
}

function initialize() {
    SetCSS();
    if (window.location.href.match('artworks')) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'xhr-download':
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';

                    xhr.addEventListener('load', (e) => {
                        chrome.runtime.sendMessage({
                            type: "download_img",
                            url: URL.createObjectURL(xhr.response),
                            filename: message.url.substr(message.url.lastIndexOf(
                                '/') + 1),
                            forceDownload: true
                        });
                    });

                    xhr.addEventListener('error', (e) => {
                        // The XHR method failed. Force an attempt using the
                        // downloads API.
                        chrome.runtime.sendMessage({
                            type: "download_img",
                            url: message.url,
                            forceDownload: true
                        });
                    });

                    xhr.open('get', message.url, true);
                    xhr.send();
                    break;
            }
        });
        var obser = new MutationObserver(function(records) {
            var role_list = document.querySelectorAll("div[role]");
            var role = role_list[role_list.length - 1];
            var color;
            if (typeof(role) == 'undefined')
                return;
            if (role.firstChild != null) {
                var button_position = role.firstChild.firstChild;
                if (button_position != null && typeof(button_position) != 'undefined') {
                    if (role.firstChild.childNodes.length == 1) {
                        color = "#006aff";
                    } else {
                        color = "#32ea49";
                    }
                    var imgson = button_position.getElementsByTagName("img")[0];
                    if (typeof(imgson) == 'undefined')
                        return;
                    ChangeSize(imgson, 1);
                    SetButton(button_position, color);
                    document.onkeydown = function(event) {
                        AddEvent(event, imgson);
                    };
                }
            }
        });
        obser.observe(document.documentElement, {
            childList: false,
            subtree: false,
            attributes: true
        });
    } else if (window.location.href.match('www.pixivision.net\/zh\/a\/')) {
        var am_works = document.getElementsByClassName("am__body");
        if (am_works.length != 1) {
            return;
        }
        var works = am_works[0].children;
        for (var i = 0; i < works.length - 1; i++) {
            var linkNode = works[i].getElementsByClassName('inner-link')[1];
            var id = linkNode.href.match("[0-9]+(?=[^0-9]*$)");
            colorMaked(id[0], works[i]);
        }
    } else if (window.location.href.match('ranking.php\\?mode=daily')) {
        var num = 0;
        var ranking_items = document.getElementsByClassName("ranking-items adjust");
        if (ranking_items.length != 1) {
            return;
        }
        var obser = new MutationObserver(function(records) {

            var items = ranking_items[0].children;
            for (var i = num; i < items.length; i++) {
                var linkNode = items[i].getElementsByClassName('work _work')[0];
                var id = linkNode.href.match("[0-9]+(?=[^0-9]*$)");
                colorMaked(id[0], linkNode.parentNode);

                var author=items[i].getElementsByClassName('user-container ui-profile-popup')[0];
                var author_id = author.href.match("[0-9]+(?=[^0-9]*)");
                colorFollowed(author_id[0],author);
            }
            num = items.length;
        });
        obser.observe(ranking_items[0], {
            childList: true,
            subtree: false
    
        });



    }
}

initialize();

