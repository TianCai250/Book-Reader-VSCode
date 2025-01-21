"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(src_exports);
var import_vscode2 = __toESM(require("vscode"));
var import_vscode3 = require("vscode");

// src/Book.ts
var import_vscode = __toESM(require("vscode"));
var import_fs = __toESM(require("fs"));
var import_iconv_lite = __toESM(require("iconv-lite"));
var import_chardet = __toESM(require("chardet"));

// src/TimeQueue.ts
var TimeQueue = class {
  constructor() {
    this.queue = [];
  }
  push(time) {
    this.queue.push(time);
    if (this.queue.length > 10) {
      this.queue = this.queue.slice(this.queue.length - 10, this.queue.length);
    }
  }
  getSpeed() {
    if (this.queue.length <= 1) {
      return 0;
    }
    let interval = (this.queue[this.queue.length - 1] - this.queue[0]) / (this.queue.length - 1);
    return Math.round(60 * 60 * 1e3 / interval);
  }
};
var TimeQueue_default = new TimeQueue();

// src/Book.ts
var Book = class {
  constructor() {
    this.curr_page_number = 1;
    this.page_size = 50;
    this.page = 0;
    this.start = 0;
    this.end = this.page_size;
    this.filePath = "";
    this.keyWords = "";
    this.content = "";
    this.getContent();
  }
  getSize(text) {
    let size = text.length;
    this.page = Math.ceil(size / this.page_size);
  }
  getPage(type) {
    var curr_page = import_vscode.default.workspace.getConfiguration().get("bookReader.currPageNumber");
    var page = 0;
    if (curr_page === void 0) {
      return;
    }
    if (this.keyWords !== "") {
      const index = this.content.indexOf(this.keyWords);
      if (index > -1) {
        page = Math.floor(index / this.page_size) + 1;
      } else {
        page = this.curr_page_number;
      }
    } else if (type === 0 /* previous */) {
      if (curr_page <= 1) {
        page = 1;
      } else {
        page = curr_page - 1;
      }
    } else if (type === 1 /* next */) {
      if (curr_page >= this.page) {
        page = this.page;
      } else {
        page = curr_page + 1;
      }
    } else if (type === 2 /* curr */) {
      page = curr_page;
    }
    this.curr_page_number = page;
  }
  updatePage() {
    import_vscode.default.workspace.getConfiguration().update("bookReader.currPageNumber", this.curr_page_number, true);
  }
  getStartEnd() {
    this.start = this.curr_page_number * this.page_size;
    this.end = this.curr_page_number * this.page_size - this.page_size;
  }
  // 获取书本内容
  getContent() {
    var _a;
    this.filePath = (_a = import_vscode.default.workspace.getConfiguration().get("bookReader.filePath")) != null ? _a : "";
    if (this.filePath === "" || typeof this.filePath === "undefined") {
      import_vscode.default.window.showWarningMessage("Book-Reader\uFF1A\u8BF7\u586B\u5199\u4E66\u7C4D\u6587\u4EF6\u8DEF\u5F84");
    }
    try {
      import_vscode.default.window.showInformationMessage("Book-Reader\uFF1A\u6B63\u5728\u89E3\u6790\u6587\u4EF6\uFF0C\u8BF7\u7A0D\u7B49...");
      let data = import_fs.default.readFileSync(this.filePath);
      if (data) {
        const detectedEncoding = import_chardet.default.detectFileSync(this.filePath);
        let utf8data = import_iconv_lite.default.decode(data, (detectedEncoding == null ? void 0 : detectedEncoding.toString()) || "UTF-8");
        var line_break = " ";
        this.content = utf8data.toString().replace(/\n/g, line_break).replace(/\r/g, " ").replace(/　　/g, " ").replace(/ /g, " ");
        import_vscode.default.window.showInformationMessage("Book-Reader\uFF1A\u89E3\u6790\u5B8C\u6210");
      }
    } catch (err) {
      import_vscode.default.window.showErrorMessage("Book-Reader\uFF1A\u672A\u641C\u7D22\u5230\u8D44\u6E90\uFF0C\u8BF7\u68C0\u67E5\u8DEF\u5F84\u662F\u5426\u6B63\u786E");
    }
  }
  init() {
    var _a, _b;
    this.page_size = (_a = import_vscode.default.workspace.getConfiguration().get("bookReader.pageSize")) != null ? _a : 50;
    this.keyWords = (_b = import_vscode.default.workspace.getConfiguration().get("bookReader.keyWords")) != null ? _b : "";
  }
  getPrePage() {
    return this.getCurrentText(0 /* previous */);
  }
  getNextPage() {
    return this.getCurrentText(1 /* next */);
  }
  getCurrentText(operateType) {
    this.init();
    this.getSize(this.content);
    this.getPage(operateType);
    this.getStartEnd();
    let page_info = "";
    if (!!import_vscode.default.workspace.getConfiguration().get("bookReader.showLine")) {
      page_info += this.curr_page_number.toString() + "/" + this.page.toString();
    }
    if (!!import_vscode.default.workspace.getConfiguration().get("bookReader.showPercent")) {
      page_info += `  ${(this.curr_page_number / this.page * 100).toFixed(2)}%`;
    }
    TimeQueue_default.push((/* @__PURE__ */ new Date()).getTime());
    if (!!import_vscode.default.workspace.getConfiguration().get("bookReader.showSpeed")) {
      page_info += `  ${TimeQueue_default.getSpeed()}\u884C/\u65F6`;
    }
    this.updatePage();
    return this.content.substring(this.start, this.end) + "    " + page_info;
  }
};
var Book_default = Book;

// src/index.ts
function activate(context) {
  const bossCode = import_vscode2.default.commands.registerCommand("extension.bossCode", () => {
    let lauage_arr_list = [
      "jquery is working",
      "vue is working",
      "react is working",
      "angular is working",
      "js is working",
      "html is working"
    ];
    var index = Math.floor(Math.random() * lauage_arr_list.length);
    import_vscode2.default.window.setStatusBarMessage(lauage_arr_list[index]);
  });
  const book = new Book_default();
  const nextPage = import_vscode2.default.commands.registerCommand("extension.nextPage", () => {
    import_vscode2.default.window.setStatusBarMessage(book.getNextPage());
  });
  const prePage = import_vscode2.default.commands.registerCommand("extension.prePage", () => {
    import_vscode2.default.window.setStatusBarMessage(book.getPrePage());
  });
  context.subscriptions.push(bossCode);
  context.subscriptions.push(nextPage);
  context.subscriptions.push(prePage);
  let timer = null;
  import_vscode3.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("bookReader.filePath")) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        book.getContent();
        timer = null;
      }, 1e3);
    }
  });
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
