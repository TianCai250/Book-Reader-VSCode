/** 翻页操作类型 */
export enum OperateType {
    previous,
    next,
    curr,
}

/** Book-Reader 所有配置项的强类型定义，与 package.json 中 contributes.configuration 对应 */
export interface BookConfig {
    currPageNumber: number;
    pageSize: number;
    filePath: string;
    keyWords: string;
    showLine: boolean;
    showPercent: boolean;
    showSpeed: boolean;
}
