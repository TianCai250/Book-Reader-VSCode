import vscode from 'vscode';
import { workspace, type ExtensionContext } from 'vscode';
import Book from './Book';

export function activate(context: ExtensionContext) {
    const bossCode = vscode.commands.registerCommand('extension.bossCode', () => {
        let lauage_arr_list: string[] = [
            'jquery is working',
            'vue is working',
            'react is working',
            'angular is working',
            'js is working',
            'html is working',
        ];
        var index = Math.floor(Math.random() * lauage_arr_list.length);
        vscode.window.setStatusBarMessage(lauage_arr_list[index]);
    });

    const book = new Book();

    const nextPage = vscode.commands.registerCommand('extension.nextPage', () => {
        vscode.window.setStatusBarMessage(book.getNextPage());
    });

    const prePage = vscode.commands.registerCommand('extension.prePage', () => {
        vscode.window.setStatusBarMessage(book.getPrePage());
    });
    context.subscriptions.push(bossCode);
    context.subscriptions.push(nextPage);
    context.subscriptions.push(prePage);

    // 配置路径改变，重新获取书籍信息
    let timer: NodeJS.Timeout | null = null;
    workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('bookReader.filePath')) {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                book.getContent();
                timer = null;
            }, 1000);
        }
    });
}

export function deactivate() {}
