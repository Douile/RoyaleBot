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
  this.addEL(tag,content) {
    var dom = document.createElement(tag);
    dom.innerHTML = content;
    this.dom.appendChild(dom);
  }
  return this;
}

const HEADERS = ['Key','','Value'];

function onLoad() {
  var root = document.getElementById('message-container');
  var heads = TableRow();
  for (var i=0;i<HEADERS.length;i++) {
    heads.addHeader(HEADERS[i]);
  }
  heads.append(root);
  loadLanguage('en',root);
}

function loadLanguage(code,root) {
  var url = `_locales/${code}/messages.json`;
  fetch(url).then((res) => {
    return res.json();
  }).then((json) => {
    for (var key in json) {
      var row = TableRow();
      row.addData(key);
      row.addData('English:<br>New:')
      row.addData(`<input type="text" readonly value="${json[key].message}"><br><input type="text" name="message_${key}">`);
      row.append(root);
    }
  })
}
window.addEventListener('load',onLoad);
