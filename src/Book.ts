import vscode from 'vscode';
import { OperateType } from './types';
import { getConfig, updateConfig } from './config';
import { loadBook } from './bookLoader';
import { calculateTotalPages, calculatePageRange, findPageByKeyword, clampPage } from './pager';
import { ReadingProgress } from './readingProgress';

/**
 * Book 协调器：整合配置、文件加载、分页、阅读速度追踪等模块，
 * 对外提供简洁的 prev()/next()/load() API。
 *
 * 注意：构造函数不再主动加载文件，由调用方（index.ts）在合适的时机调用 load()，
 * 避免插件激活时因缺少路径配置而报错。
 */
export class Book {
    private content = '';
    private currPageNumber = 1;
    private totalPages = 0;
    private progress = new ReadingProgress();

    /** 根据当前配置中的 filePath 异步加载书籍内容 */
    async load(): Promise<void> {
        const { filePath } = getConfig();
        if (!filePath) {
            vscode.window.showWarningMessage('Book-Reader：请填写书籍文件路径');
            return;
        }

        try {
            this.content = await loadBook(filePath);
            this.totalPages = calculateTotalPages(this.content, getConfig().pageSize);
            this.currPageNumber = clampPage(getConfig().currPageNumber, this.totalPages);
            this.progress.reset();
        } catch {
            // 错误已在 bookLoader 中提示，这里静默吞掉避免重复弹窗
        }
    }

    /** 上一页 */
    prev(): string {
        return this.getText(OperateType.previous);
    }

    /** 下一页 */
    next(): string {
        return this.getText(OperateType.next);
    }

    /** 核心翻页逻辑：计算页码、持久化进度、记录阅读速度、返回状态栏文本 */
    private getText(type: OperateType): string {
        if (!this.content) {
            return 'Book-Reader：未加载书籍，请检查路径配置';
        }

        const config = getConfig();
        this.totalPages = calculateTotalPages(this.content, config.pageSize);

        this.currPageNumber = this.resolvePage(type, config);
        updateConfig('currPageNumber', this.currPageNumber);

        // 关键词跳转是一次性行为，完成后清空配置避免重复跳转
        if (config.keyWords) {
            updateConfig('keyWords', '');
        }

        this.progress.record();

        const { start, end } = calculatePageRange(this.currPageNumber, config.pageSize);
        const text = this.content.substring(start, end);
        const info = this.formatPageInfo(config);
        return text + '    ' + info;
    }

    /** 根据操作类型和当前状态解析目标页码 */
    private resolvePage(type: OperateType, config: ReturnType<typeof getConfig>): number {
        if (config.keyWords) {
            const keywordPage = findPageByKeyword(this.content, config.keyWords, config.pageSize);
            // 关键词找不到时保持当前页，不跳转
            return keywordPage ?? config.currPageNumber;
        }

        if (type === OperateType.previous) {
            return clampPage(config.currPageNumber - 1, this.totalPages);
        }

        if (type === OperateType.next) {
            return clampPage(config.currPageNumber + 1, this.totalPages);
        }

        return clampPage(config.currPageNumber, this.totalPages);
    }

    /** 按用户配置拼接页码、百分比、阅读速度等信息 */
    private formatPageInfo(config: ReturnType<typeof getConfig>): string {
        const parts: string[] = [];

        if (config.showLine) {
            parts.push(`${this.currPageNumber}/${this.totalPages}`);
        }

        if (config.showPercent && this.totalPages > 0) {
            parts.push(`${((this.currPageNumber / this.totalPages) * 100).toFixed(2)}%`);
        }

        if (config.showSpeed) {
            parts.push(`${this.progress.getSpeed()}行/时`);
        }

        return parts.join('  ');
    }
}
