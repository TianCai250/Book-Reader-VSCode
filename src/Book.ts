import vscode from 'vscode';
import fs from 'fs';
// import iconv from 'iconv-lite';
// import chardet from 'chardet';

// 操作类型
enum IOperateType {
    previous,
    next,
    curr,
}

class Book {
    private curr_page_number: number;
    private page_size: number;
    private page: number;
    private start: number;
    private end: number;
    private filePath: string;
    private keyWords: string;

    constructor() {
        this.curr_page_number = 1;
        this.page_size = 50;
        this.page = 0;
        this.start = 0;
        this.end = this.page_size;
        this.filePath = '';
        this.keyWords = '';
    }
    getSize(text: string) {
        let size = text.length;
        this.page = Math.ceil(size / this.page_size);
    }
    getPage(type: IOperateType) {
        var curr_page = vscode.workspace.getConfiguration().get<number>('bookReader.currPageNumber');
        var page = 0;
        if (curr_page === undefined) {
            return;
        }
        if (this.keyWords !== '') {
            // 跳转关键词位置
            let text = this.readFile();
            const index = text.indexOf(this.keyWords);
            if (index > -1) {
                page = Math.floor(index / this.page_size) + 1;
            } else {
                page = this.curr_page_number;
            }
        } else if (type === IOperateType.previous) {
            if (curr_page <= 1) {
                page = 1;
            } else {
                page = curr_page - 1;
            }
        } else if (type === IOperateType.next) {
            if (curr_page >= this.page) {
                page = this.page;
            } else {
                page = curr_page + 1;
            }
        } else if (type === IOperateType.curr) {
            page = curr_page;
        }
        this.curr_page_number = page;
    }
    updatePage() {
        vscode.workspace.getConfiguration().update('bookReader.currPageNumber', this.curr_page_number, true);
    }
    getStartEnd() {
        this.start = this.curr_page_number * this.page_size;
        this.end = this.curr_page_number * this.page_size - this.page_size;
    }
    readFile() {
        if (this.filePath === '' || typeof this.filePath === 'undefined') {
            vscode.window.showWarningMessage('请填写书籍文件路径');
        }
        let data = fs.readFileSync(this.filePath, 'utf-8');
        // 过于卡顿
        // const detectedEncoding = chardet.detectFileSync(this.filePath);
        // let utf8data = iconv.decode(data, detectedEncoding?.toString() || '');
        var line_break = ' ';
        return data
            .toString()
            .replace(/\n/g, line_break)
            .replace(/\r/g, ' ')
            .replace(/　　/g, ' ')
            .replace(/ /g, ' ');
    }
    init() {
        this.filePath = vscode.workspace.getConfiguration().get('bookReader.filePath') ?? '';
        this.page_size = vscode.workspace.getConfiguration().get('bookReader.pageSize') ?? 50;
        this.keyWords = vscode.workspace.getConfiguration().get('bookReader.keyWords') ?? '';
    }
    getPrePage() {
        this.init();
        let text = this.readFile();
        this.getSize(text);
        this.getPage(IOperateType.previous);
        this.getStartEnd();
        var page_info = this.curr_page_number.toString() + '/' + this.page.toString();
        this.updatePage();
        return text.substring(this.start, this.end) + '    ' + page_info;
    }
    getNextPage() {
        this.init();
        let text = this.readFile();
        this.getSize(text);
        this.getPage(IOperateType.next);
        this.getStartEnd();
        var page_info = this.curr_page_number.toString() + '/' + this.page.toString();
        this.updatePage();
        return text.substring(this.start, this.end) + '    ' + page_info;
    }
}

export default Book;
