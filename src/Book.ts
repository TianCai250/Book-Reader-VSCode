import vscode from 'vscode';
import fs from 'fs';
import iconv from 'iconv-lite';
import chardet from 'chardet';
import TimeQueue from './TimeQueue';

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
    private content: string;

    constructor() {
        this.curr_page_number = 1;
        this.page_size = 50;
        this.page = 0;
        this.start = 0;
        this.end = this.page_size;
        this.filePath = '';
        this.keyWords = '';
        this.content = '';
        this.getContent();
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
            const index = this.content.indexOf(this.keyWords);
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
    // 获取书本内容
    getContent() {
        this.filePath = vscode.workspace.getConfiguration().get('bookReader.filePath') ?? '';
        if (this.filePath === '' || typeof this.filePath === 'undefined') {
            vscode.window.showWarningMessage('Book-Reader：请填写书籍文件路径');
        }
        try {
            vscode.window.showInformationMessage('Book-Reader：正在解析文件，请稍等...');
            let data = fs.readFileSync(this.filePath);
            if (data) {
                const detectedEncoding = chardet.detectFileSync(this.filePath);
                let utf8data = iconv.decode(data, detectedEncoding?.toString() || 'UTF-8');
                var line_break = ' ';
                this.content = utf8data
                    .toString()
                    .replace(/\n/g, line_break)
                    .replace(/\r/g, ' ')
                    .replace(/　　/g, ' ')
                    .replace(/ /g, ' ');
                vscode.window.showInformationMessage('Book-Reader：解析完成');
            }
        } catch (err) {
            vscode.window.showErrorMessage('Book-Reader：未搜索到资源，请检查路径是否正确');
        }
    }
    init() {
        this.page_size = vscode.workspace.getConfiguration().get('bookReader.pageSize') ?? 50;
        this.keyWords = vscode.workspace.getConfiguration().get('bookReader.keyWords') ?? '';
    }
    getPrePage() {
        return this.getCurrentText(IOperateType.previous);
    }
    getNextPage() {
        return this.getCurrentText(IOperateType.next);
    }
    getCurrentText(operateType: IOperateType) {
        this.init();
        this.getSize(this.content);
        this.getPage(operateType);
        if (this.keyWords.length) {
            vscode.workspace.getConfiguration().update('bookReader.keyWords', '', true);
            this.keyWords = '';
        }

        this.getStartEnd();
        let page_info = '';
        // 行数进度
        if (!!vscode.workspace.getConfiguration().get('bookReader.showLine')) {
            page_info += this.curr_page_number.toString() + '/' + this.page.toString();
        }
        // 阅读进度
        if (!!vscode.workspace.getConfiguration().get('bookReader.showPercent')) {
            page_info += `  ${((this.curr_page_number / this.page) * 100).toFixed(2)}%`;
        }
        // 记录时间，测算阅读速度
        TimeQueue.push(new Date().getTime());
        if (!!vscode.workspace.getConfiguration().get('bookReader.showSpeed')) {
            page_info += `  ${TimeQueue.getSpeed()}行/时`;
        }
        this.updatePage();
        return this.content.substring(this.start, this.end) + '    ' + page_info;
    }
}

export default Book;
