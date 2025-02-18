import { Column } from '../column/Column';
import type { ITitleDrawFormat } from '../format/title/ITitleDrawFormat';
import { TableData } from './TableData';

export class PageTableData<T> extends TableData<T> {
  private totalData: T[];
  private currentPage: number;
  private totalPage: number;
  private pageSize: number;
  private pageData: T[];

  constructor(tableName: string, t: T[], columns: Column[], titleDrawFormat: ITitleDrawFormat) {
    super(tableName, t, columns, titleDrawFormat);
    this.pageData = [];
    this.totalData = t;
    this.pageSize = t.length;
    this.currentPage = 0;
    this.totalPage = 1;
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  setCurrentPage(currentPage: number): void {
    if (currentPage < 0) {
      currentPage = 0;
    } else if (currentPage >= this.totalPage) {
      currentPage = this.totalPage - 1;
    }
    this.currentPage = currentPage;
    this.pageData = [];
    const totalSize = this.totalData.length;
    for (let i = currentPage * this.pageSize; i < (currentPage + 1) * this.pageSize; i++) {
      if (i < totalSize) {
        this.pageData.push(this.totalData[i]);
      }
    }
    this.setT(this.pageData);
  }

  getTotalPage(): number {
    return this.totalPage;
  }

  getPageSize(): number {
    return this.pageSize;
  }

  setPageSize(pageSize: number): void {
    const total = this.totalData.length;
    if (pageSize < 1) {
      pageSize = 1;
    } else if (pageSize > total) {
      pageSize = total;
    }
    this.pageSize = pageSize;
    this.totalPage = Math.floor(total / pageSize);
    this.totalPage = total % pageSize === 0 ? this.totalPage : this.totalPage + 1;
    this.setCurrentPage(this.currentPage);
  }
}
