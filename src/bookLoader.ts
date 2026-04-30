import fs from 'fs';
import chardet from 'chardet';
import iconv from 'iconv-lite';
import vscode from 'vscode';

/**
 * 异步读取本地书籍文件，自动检测编码并转换为 UTF-8。
 * 使用 fs.readFile + chardet.detect(data) 避免重复磁盘 IO（旧代码用 detectFileSync 会再读一次文件）。
 */
export async function loadBook(filePath: string): Promise<string> {
    if (!filePath) {
        throw new Error('请填写书籍文件路径');
    }

    return new Promise((resolve, reject) => {
        vscode.window.showInformationMessage('Book-Reader：正在解析文件，请稍等...');

        fs.readFile(filePath, (err, data) => {
            if (err) {
                vscode.window.showErrorMessage('Book-Reader：未搜索到资源，请检查路径是否正确');
                reject(err);
                return;
            }

            // 在内存 buffer 上检测编码，无需再次读取文件
            const detectedEncoding = chardet.detect(data);
            const decoded = iconv.decode(data, detectedEncoding?.toString() || 'UTF-8');
            const cleaned = cleanContent(decoded);

            vscode.window.showInformationMessage('Book-Reader：解析完成');
            resolve(cleaned);
        });
    });
}

/** 将换行、全角空格等统一压缩为普通空格，保证状态栏单行显示 */
function cleanContent(text: string): string {
    return text
        .replace(/\r?\n/g, ' ')
        .replace(/　　/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
