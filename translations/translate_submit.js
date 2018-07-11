const MSG_PREFIX = 'message_';

function parseSearch(string) {
  if (string.startsWith('?')) {
    string.substr(1);
  }
  var values = string.split('&');
  var data = {};
  for (var i=0;i<values.length;i++) {
    var args = values[i].split('=');
    var key = args[0];
    var value = args[1];
    data[key] = value;
  }
  return data;
}
function parseData(data) {
  var manifest = {
    name: '',
    name_en: '',
    author: '',
    author_name: ''
  };
  var messages = {};
  var code;
  for (var key in data) {
    var value = data[key];
    if (key == 'author_name') {
      manifest['author_name'] = value;
    } else if (key == 'author') {
      manifest['author'] = value;
    } else if (key == 'lang_name') {
      manifest['name'] = value;
    } else if (key == 'lang_name_en') {
      manifest['name_en'] = value;
    } else if (key == 'lang_code') {
      code = value;
    } else if (key.startsWith(MSG_PREFIX)) {
      var msgKey = key.substr(MSG_PREFIX.length);
      messages[msgKey] = value;
    }
  }
  return {
    manifest: manifest,
    messages: messages,
    code: code
  };
}
var saveAs = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
function save() {
  var data = parseSearch(location.search);
  var parsed = parseData(data);
  var zip = new JSZip();
  var folder = zip.folder(parsed.code);
  folder.file('manifest.json',JSON.stringify(parsed.manifest));
  folder.file('messages.json',JSON.stringify(parsed.messages));
  zip.generateAsync({type:'blob'}).then(function(content) {
    saveAs(content,`${parsed.code}.zip`);
  })
}
save();
