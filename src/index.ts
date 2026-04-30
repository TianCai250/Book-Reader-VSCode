/**
 * 插件入口：注册命令、管理生命周期、协调 Book 实例。
 * 所有命令操作最终通过 Book 实例完成，保持入口层薄而清晰。
 */
import vscode from 'vscode';
import { workspace, type ExtensionContext } from 'vscode';
import { Book } from './Book';

const BOSS_MESSAGES = [
    'jquery is working',
    'vue is working',
    'react is working',
    'angular is working',
    'js is working',
    'html is working',
];

/** 状态栏项实例，支持颜色自定义，替代 setStatusBarMessage */
const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

function updateStatusBar(text: string) {
    const config = vscode.workspace.getConfiguration('bookReader');
    const customColor = config.get<string>('textColor');
    const useProminent = config.get<boolean>('useProminentColor');

    statusBar.text = text;

    if (customColor) {
        statusBar.color = customColor;
    } else if (useProminent) {
        statusBar.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
    } else {
        statusBar.color = undefined;
    }

    statusBar.show();
}

export function activate(context: ExtensionContext) {
    const book = new Book();

    /** 老板键：在状态栏显示伪装的工作信息 */
    const bossCode = vscode.commands.registerCommand('extension.bossCode', () => {
        const message = BOSS_MESSAGES[Math.floor(Math.random() * BOSS_MESSAGES.length)];
        updateStatusBar(message);
    });

    const nextPage = vscode.commands.registerCommand('extension.nextPage', () => {
        updateStatusBar(book.next());
    });

    const prePage = vscode.commands.registerCommand('extension.prePage', () => {
        updateStatusBar(book.prev());
    });

    context.subscriptions.push(bossCode, nextPage, prePage, statusBar);

    // 配置路径改变时防抖重新加载，避免连续修改配置触发多次 IO
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('bookReader.filePath')) {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                book.load();
                debounceTimer = null;
            }, 1000);
        }

        // 颜色配置变化时实时刷新当前状态栏颜色
        if (event.affectsConfiguration('bookReader.textColor') ||
            event.affectsConfiguration('bookReader.useProminentColor')) {
            const currentText = statusBar.text;
            if (currentText) {
                updateStatusBar(currentText);
            }
        }
    });

    // 如果已有路径配置，自动加载书籍
    book.load();
}

export function deactivate() {}
