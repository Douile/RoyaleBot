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
const LOCALES = {'en':'English','nl':'Dutch','br':'Portuguese'};

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
  loadLanguage('en',root);
}

function selectNew(e) {
  var code = e.target.value;
  loadLanguage(code);
}

function loadLanguage(code,root) {
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
      row.addData(`<input type="text" readonly value="${json[key].message.replace('\\','\\\\')}"><br><input type="text" name="message_${key}">`);
      row.append(root);
    }
  })
}
window.addEventListener('load',onLoad);
