document.onload = onDomLoad();
window.onload = onDomLoad();

window._hasrun = false;
function onDomLoad() {
    if (window._hasrun) return;
    window._hasrun = true;
    setJSContentFlag();
    insertUriString();
}



function setJSContentFlag() {
    bd = document.body;
    if (bd.classList && bd.classList.add) {
        bd.classList.remove('js-disabled');
        bd.classList.add('js-enabled');
    }
    else if (bd.className) {
        // assuming this script is only run once, so not needed if already present.
        // assuming body has only the js-disabled class when running this script.
        bd.className = "js-enabled";
    }
    // else not possible to set class name
}

// Gets the true path and sets the .true-url-path innerHTML
// this is useful because the /404 page is permalinked, and thus does not show the entered url in the breadcrumb/jekyll variables.
function insertUriString() {
    classString = "true-url-path";
    uri = _cleanUriString(location.pathname);

    if (document.getElementsByClassName) {
        console.log("classname");
        els = document.getElementsByClassName(classString);
    }
    else {
        // IE6-8 does not support query by classname. Only id, html tag, name
        // fallback on get by name
        console.log('name')
        els = document.getElementsByName(classString);
    }
    console.log(els.length, els)
    if (els == undefined || els == null) return;
    if (els.length < 0) return; // No elements found

    for (i = 0; i < els.length; i++) {
        el = els[i];
        _insertUriInDom(el, uri);
    }
}

function _cleanUriString(uri) {
    if (uri == "" || uri == undefined || uri == null) uri = "/";
    if (uri[0] != '/') uri = '/' + uri; // IE does not add a leading slash
    if (uri.indexOf && uri.indexOf('?') != -1) {
        uri = uri.slice(0, uri.indexOf('?')); // Firefox Android 53 contained a bug where it included query parameters in the path.
    }
    return uri;
}


function _insertUriInDom(el, uri) {
    el.innerHTML = uri;
    
    if (el.tagName && el.tagName == 'A') {
        el.href = uri;
    }
}