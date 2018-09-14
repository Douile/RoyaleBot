function TableRow() {
  this.dom = document.createElement('tr');
  this.append = function(parent) {
    parent.appendChild(this.dom);
  }
  this.addHeader = function(content) {
    this.addEL('th',content);
  }
  this.addData = function(content) {
    this.addEL('td',content);
  }
  this.addEL = function(tag,content) {
    var dom = document.createElement(tag);
    dom.innerHTML = content;
    this.dom.appendChild(dom);
  }
  return this;
}

const HEADERS = ['Key','','Value'];
const LOCALES = {'en':'English','nl':'Dutch','pt-br':'Portuguese'};

function onLoad() {
  var root = document.getElementById('message-container');
  var heads = TableRow();
  for (var i=0;i<HEADERS.length;i++) {
    heads.addHeader(HEADERS[i]);
  }
  heads.append(root);
  var select = document.getElementById('choose-locale');
  for (var code in LOCALES) {
    var option = document.createElement('option');
    option.innerText = LOCALES[code];
    option.setAttribute('value',code);
    select.appendChild(option);
  }
  select.addEventListener('change',selectNew);
  var form = document.getElementById('translate_form');
  form.addEventListener('submit',(e) => {
    e.preventDefault();
    var data = {},
    doms = document.getElementsByTagName('input');
    for (var i=0;i<doms.length;i++) {
      data[doms[i].getAttribute('name')] = doms[i].value();
    }
    save(data);
  })
  loadLanguage('en',root);
}

function selectNew(e) {
  var code = e.target.value;
  loadLanguage(code);
}

function loadLanguage(code,root) {
  var root = document.getElementById('message-container');
  while (root.children.length > 0) {
    root.firstChild.remove();
  }
  var url = `locales/${code}/messages.json`;
  fetch(url).then((res) => {
    return res.json();
  }).then((json) => {
    for (var key in json) {
      var row = TableRow();
      row.addData(key);
      row.addData('Original:<br>New:')
      row.addData(`<input type="text" readonly value="${json[key].message.replace('\n','\\n')}"><br><input type="text" name="message_${key}">`);
      row.append(root);
    }
  })
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
      messages[msgKey] = {'message':value};
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
    return function (blob, fileName) {
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
function save(data) {
  var parsed = parseData(data);
  var zip = new JSZip();
  var folder = zip.folder(parsed.code);
  folder.file('manifest.json',JSON.stringify(parsed.manifest));
  folder.file('messages.json',JSON.stringify(parsed.messages));
  zip.generateAsync({type:'blob'}).then(function(content) {
    saveAs(content,`${parsed.code}.zip`);
  })
}
window.addEventListener('load',onLoad);
