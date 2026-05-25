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
    private pageSize = 50;
    private totalPages = 0;
    private persistedPageNumber = 1;
    private persistTimer: ReturnType<typeof setTimeout> | null = null;
    private progress = new ReadingProgress();
    private static readonly PROGRESS_PERSIST_DELAY_MS = 1500;

    /** 根据当前配置中的 filePath 异步加载书籍内容 */
    async load(): Promise<void> {
        const { filePath } = getConfig();
        if (!filePath) {
            vscode.window.showWarningMessage('Book-Reader：请填写书籍文件路径');
            return;
        }

        try {
            await this.flushProgress();
            this.content = await loadBook(filePath);
            const config = getConfig();
            this.pageSize = config.pageSize;
            this.totalPages = calculateTotalPages(this.content, this.pageSize);
            this.currPageNumber = clampPage(config.currPageNumber, this.totalPages);
            this.persistedPageNumber = this.currPageNumber;
            this.progress.reset();
        } catch {
            // 错误已在 bookLoader 中提示，这里静默吞掉避免重复弹窗
        }
    }

    /** pageSize 变化时重算分页信息，翻页展示使用内存态结果 */
    onPageSizeChanged(): void {
        if (!this.content) {
            return;
        }

        const { pageSize } = getConfig();
        if (pageSize === this.pageSize) {
            return;
        }

        this.pageSize = pageSize;
        this.totalPages = calculateTotalPages(this.content, this.pageSize);
        this.currPageNumber = clampPage(this.currPageNumber, this.totalPages);
        this.schedulePersistProgress();
    }

    /** 将内存页码立即落盘（用于停用扩展/切书前） */
    async flushProgress(): Promise<void> {
        if (this.persistTimer) {
            clearTimeout(this.persistTimer);
            this.persistTimer = null;
        }
        await this.persistProgress();
    }

    /** 上一页 */
    prev(): string {
        return this.getText(OperateType.previous);
    }

    /** 下一页 */
    next(): string {
        return this.getText(OperateType.next);
    }

    /** 核心翻页逻辑：计算页码、更新内存进度、记录阅读速度、返回状态栏文本 */
    private getText(type: OperateType): string {
        if (!this.content) {
            return 'Book-Reader：未加载书籍，请检查路径配置';
        }

        const config = getConfig();
        if (config.pageSize !== this.pageSize) {
            this.pageSize = config.pageSize;
            this.totalPages = calculateTotalPages(this.content, this.pageSize);
            this.currPageNumber = clampPage(this.currPageNumber, this.totalPages);
        }

        this.currPageNumber = this.resolvePage(type, config);
        this.schedulePersistProgress();

        // 关键词跳转是一次性行为，完成后清空配置避免重复跳转
        if (config.keyWords) {
            updateConfig('keyWords', '');
        }

        this.progress.record();

        const { start, end } = calculatePageRange(this.currPageNumber, this.pageSize);
        const text = this.content.substring(start, end);
        const info = this.formatPageInfo(config);
        return text + '    ' + info;
    }

    /** 根据操作类型和当前状态解析目标页码 */
    private resolvePage(type: OperateType, config: ReturnType<typeof getConfig>): number {
        if (config.keyWords) {
            const keywordPage = findPageByKeyword(this.content, config.keyWords, this.pageSize);
            // 关键词找不到时保持当前页，不跳转
            return keywordPage ?? this.currPageNumber;
        }

        if (type === OperateType.previous) {
            return clampPage(this.currPageNumber - 1, this.totalPages);
        }

        if (type === OperateType.next) {
            return clampPage(this.currPageNumber + 1, this.totalPages);
        }

        return clampPage(this.currPageNumber, this.totalPages);
    }

    /** 防抖持久化：将多次翻页合并为一次配置写入 */
    private schedulePersistProgress(): void {
        if (this.persistTimer) {
            clearTimeout(this.persistTimer);
        }

        this.persistTimer = setTimeout(() => {
            void this.persistProgress();
            this.persistTimer = null;
        }, Book.PROGRESS_PERSIST_DELAY_MS);
    }

    /** 落盘当前页码，避免每次翻页都触发配置写入 */
    private async persistProgress(): Promise<void> {
        if (this.currPageNumber === this.persistedPageNumber) {
            return;
        }

        await updateConfig('currPageNumber', this.currPageNumber);
        this.persistedPageNumber = this.currPageNumber;
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
