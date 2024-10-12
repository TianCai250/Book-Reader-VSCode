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

// src/Book.ts
var import_vscode = __toESM(require("vscode"));
var import_fs = __toESM(require("fs"));
var Book = class {
  constructor() {
    this.curr_page_number = 1;
    this.page_size = 50;
    this.page = 0;
    this.start = 0;
    this.end = this.page_size;
    this.filePath = "";
    this.keyWords = "";
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
      let text = this.readFile();
      const index = text.indexOf(this.keyWords);
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
  readFile() {
    if (this.filePath === "" || typeof this.filePath === "undefined") {
      import_vscode.default.window.showWarningMessage("\u8BF7\u586B\u5199\u4E66\u7C4D\u6587\u4EF6\u8DEF\u5F84");
    }
    let data = import_fs.default.readFileSync(this.filePath, "utf-8");
    var line_break = " ";
    return data.toString().replace(/\n/g, line_break).replace(/\r/g, " ").replace(/　　/g, " ").replace(/ /g, " ");
  }
  init() {
    var _a, _b, _c;
    this.filePath = (_a = import_vscode.default.workspace.getConfiguration().get("bookReader.filePath")) != null ? _a : "";
    this.page_size = (_b = import_vscode.default.workspace.getConfiguration().get("bookReader.pageSize")) != null ? _b : 50;
    this.keyWords = (_c = import_vscode.default.workspace.getConfiguration().get("bookReader.keyWords")) != null ? _c : "";
  }
  getPrePage() {
    this.init();
    let text = this.readFile();
    this.getSize(text);
    this.getPage(0 /* previous */);
    this.getStartEnd();
    var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
    this.updatePage();
    return text.substring(this.start, this.end) + "    " + page_info;
  }
  getNextPage() {
    this.init();
    let text = this.readFile();
    this.getSize(text);
    this.getPage(1 /* next */);
    this.getStartEnd();
    var page_info = this.curr_page_number.toString() + "/" + this.page.toString();
    this.updatePage();
    return text.substring(this.start, this.end) + "    " + page_info;
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
  const nextPage = import_vscode2.default.commands.registerCommand("extension.nextPage", () => {
    import_vscode2.default.window.setStatusBarMessage(new Book_default().getNextPage());
  });
  const prePage = import_vscode2.default.commands.registerCommand("extension.prePage", () => {
    import_vscode2.default.window.setStatusBarMessage(new Book_default().getPrePage());
  });
  context.subscriptions.push(bossCode);
  context.subscriptions.push(nextPage);
  context.subscriptions.push(prePage);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
