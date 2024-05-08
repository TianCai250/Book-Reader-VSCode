import vscode from 'vscode';
import type { ExtensionContext } from 'vscode';
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

    const nextPage = vscode.commands.registerCommand('extension.nextPage', () => {
        vscode.window.setStatusBarMessage(new Book().getNextPage());
    });

    const prePage = vscode.commands.registerCommand('extension.prePage', () => {
        vscode.window.setStatusBarMessage(new Book().getPrePage());
    });
    context.subscriptions.push(bossCode);
    context.subscriptions.push(nextPage);
    context.subscriptions.push(prePage);
}

export function deactivate() {}
