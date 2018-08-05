
'use strict';

function SetCSS() {
    var css_rule_text = 'Button {padding:0; margin:0;width:100px; height:100px; background-color:#006aff; filter: opacity(40%)}',
    pa = document.querySelector('head'),
    css_style = document.createElement('style'),
    css_rule = document.createTextNode(css_rule_text);
    css_style.type = 'text/css';
    css_style.className = 'mycss-rule';
    css_style.appendChild(css_rule);
    pa.appendChild(css_style);
}

function get_img_src(option) {
    if (option === 'manga_page') {
        var img = document.getElementsByTagName("img")[0];
        return img.src;
    } else if (option === 'medium') {
        var img = document.getElementsByClassName("_1V2heP9")[0];
        var imgson = img.getElementsByTagName("img")[0];
        return imgson.src;
    } else {
        return null;
    }
}

function ChangeSize(img, is_first) {
    var image_size_types = {
        'full': 'fit-height',
        'fit-height': 'fit-width',
        'fit-width': 'full'
    };
    var saved_image_size = localStorage['pixiv_plus_saved_image_size'];
    var image_size = (image_size_types[saved_image_size]) ? (image_size_types[saved_image_size]) : 'full';
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
// 	var img_filename=
// }

function SetButton(button_position, option) {
    var buttonContainer = document.createElement("div");
    buttonContainer.style.textAlign = 'center';

    var download_button = document.createElement("button");
    var close_button = document.createElement("button");

    var download_url = get_img_src(option);
    //var download_filename=get_img_filename(download_url);

    download_button.className = 'download_btn';
    download_button.onmouseover = function () {
        download_button.style.filter = "opacity(100%)";
    };
    download_button.onmouseout = function () {
        download_button.style.filter = "opacity(40%)";
    };
    download_button.addEventListener("click", function () {
        chrome.runtime.sendMessage({
            type: "download_img",
            url: download_url
            //filename:download_filename;
        });
        event.stopPropagation();
        event.preventDefault();
    });

    var download_bgImage = document.createElement("img");
    var download_bgimg = chrome.extension.getURL("images/download.png");
    download_bgImage.src = download_bgimg;
    download_bgImage.style.height = '90px';
    download_button.appendChild(download_bgImage);

    buttonContainer.appendChild(download_button);

    close_button.className = 'close_btn';
    close_button.onmouseover = function () {
        close_button.style.filter = "opacity(100%)";
    };
    close_button.onmouseout = function () {
        close_button.style.filter = "opacity(40%)";
    };
    close_button.addEventListener("click", function () {
        (window.open('', '_self')).close();
    });

    var close_bgImage = document.createElement("img");
    var close_bgimg = chrome.extension.getURL("images/close.png");
    close_bgImage.src = close_bgimg;
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
function initialize() {
    SetCSS();
    if (window.location.href.match('manga_big')) {

        var img = document.getElementsByTagName("img")[0];
        ChangeSize(img, 1);
        SetButton(document.body, 'manga_page');
        document.onkeydown = function (event) {
            AddEvent(event, img);
        };
    } else if (window.location.href.match('medium')) {
        var obser = new MutationObserver(function (records) {
                var button_position = document.getElementsByClassName("_1V2heP9")[0];
                if (typeof(button_position) != 'undefined') {
                    var img = document.getElementsByClassName("_1V2heP9")[0];
                    var imgson = img.getElementsByTagName("img")[0];
                    ChangeSize(imgson, 1);
                    SetButton(button_position, 'medium')
                    document.onkeydown = function (event) {
                        AddEvent(event, imgson);
                    };
                }
            });
        obser.observe(document.documentElement, {
            childList: false,
            subtree: false,
            attributes: true
        });
    }
}

initialize();
