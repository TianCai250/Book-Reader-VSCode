import vscode from 'vscode';
import { BookConfig } from './types';

const CONFIG_SECTION = 'bookReader';

/** 集中读取 Book-Reader 配置，消除各模块分散调用 vscode API 的重复代码 */
export function getConfig(): BookConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
        currPageNumber: config.get<number>('currPageNumber') ?? 1,
        pageSize: config.get<number>('pageSize') ?? 50,
        filePath: config.get<string>('filePath') ?? '',
        keyWords: config.get<string>('keyWords') ?? '',
        showLine: config.get<boolean>('showLine') ?? true,
        showPercent: config.get<boolean>('showPercent') ?? true,
        showSpeed: config.get<boolean>('showSpeed') ?? true,
    };
}

/** 更新全局配置并持久化到用户设置（true 表示写入用户级别配置） */
export async function updateConfig(key: keyof BookConfig, value: unknown): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await config.update(key, value, true);
}
