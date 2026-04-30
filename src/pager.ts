/** 纯函数分页引擎：所有函数无副作用，输入确定则输出确定，便于测试 */

export function calculateTotalPages(content: string, pageSize: number): number {
    if (pageSize <= 0) {
        return 1;
    }
    return Math.ceil(content.length / pageSize);
}

/** 计算指定页码在文本中的起止索引（end 为开区间） */
export function calculatePageRange(page: number, pageSize: number): { start: number; end: number } {
    const start = (page - 1) * pageSize;
    const end = page * pageSize;
    return { start, end };
}

/** 根据关键词在全文中的位置推算所在页码 */
export function findPageByKeyword(content: string, keyword: string, pageSize: number): number {
    if (!keyword || !content) {
        return 1;
    }
    const index = content.indexOf(keyword);
    if (index === -1) {
        return 1;
    }
    return Math.floor(index / pageSize) + 1;
}

/** 将页码限制在有效范围 [1, totalPages] 内 */
export function clampPage(page: number, totalPages: number): number {
    if (page < 1) {
        return 1;
    }
    if (page > totalPages) {
        return totalPages;
    }
    return page;
}
