import { CellRange } from '../data/CellRange';
import { TableInfo } from '../data/TableInfo';
import { ArrayColumn } from '../data/column/ArrayColumn';
import { Column } from '../data/column/Column';
import { ColumnNode } from '../data/column/ColumnNode';
import { ArrayTableData } from '../data/table/ArrayTableData';
import { TableData } from '../data/table/TableData';

/**
 * Created by huang on 2017/10/31.
 * 表格解析器
 */

export class TableParser<T> {
  private bottomColumn: ArrayColumn<T> | null = null;

  /**
   * 解析数据
   */
  public parse(tableData: TableData<T>): Column[] {
    tableData.getChildColumns().length = 0;
    tableData.getColumnInfos().length = 0;
    const maxLevel = this.getChildColumn(tableData);
    const tableInfo = tableData.getTableInfo();
    tableInfo.setColumnSize(tableData.getChildColumns().length);
    tableInfo.setMaxLevel(maxLevel);
    tableData.clearCellRangeAddresses();
    this.addArrayNode(tableInfo, tableData.getChildColumns());
    if (!(tableData instanceof ArrayTableData)) {
      this.sort(tableData);
      try {
        const dataList = tableData.getT();
        let i = 0;
        for (const column of tableData.getChildColumns()) {
          column.getDatas().length = 0;
          column.fillData(dataList);
          const ranges = column.parseRanges();
          if (ranges && ranges.length > 0) {
            for (const range of ranges) {
              tableData.addCellRange(new CellRange(range[0], range[1], i, i));
            }
          }
          i++;
        }
        this.calculateArrayCellSize(tableInfo, tableData.getChildColumns());
      } catch (e) {
        throw e;
      }
    }
    return tableData.getColumns();
  }

  /**
   * 添加到数组节点
   * 用于数组Column 统计
   */
  private addArrayNode(tableInfo: TableInfo, childColumns: Column[]): void {
    for (const child of childColumns) {
      if (child instanceof ArrayColumn) {
        const column = child;
        let topNode = tableInfo.getTopNode();
        if (!topNode) {
          topNode = new ColumnNode('top', null);
          tableInfo.setTopNode(topNode);
        }
        const nodeNames = column.getFieldName().split('\\.');
        loop1: for (let i = 0; i < nodeNames.length; i++) {
          const nodeName = nodeNames[i];
          for (const node of topNode.getChildren()) {
            if (node.getName() === nodeName) {
              topNode = node;
              continue loop1;
            }
          }
          let childNode;
          if (i === nodeNames.length - 1) {
            childNode = new ColumnNode(nodeName, topNode, column);
            column.setNode(childNode);
          } else {
            childNode = new ColumnNode(nodeName, topNode);
          }
          topNode.getChildren().push(childNode);
          topNode = childNode;
        }
      }
    }
    let maxLevel = 0;
    for (const child of childColumns) {
      if (child instanceof ArrayColumn) {
        const column = child;
        const level = column.getLevel();
        if (maxLevel <= level) {
          maxLevel = level;
          this.bottomColumn = column;
          this.bottomColumn.getStructure().setEffective(true);
        }
      }
    }
  }

  private calculateArrayCellSize(tableInfo: TableInfo, childColumns: Column[]): void {
    if (this.bottomColumn) {
      const bottomStructure = this.bottomColumn.getStructure();
      for (const child of childColumns) {
        if (child instanceof ArrayColumn) {
          const column = child;
          const structure = column.getStructure();
          const level = column.getStructure().getMaxLevel();
          if (!structure.getCellSizes()) {
            structure.setCellSizes([]);
          } else {
            structure.getCellSizes().length = 0;
          }
          const size = column.getDatas().length;
          for (let i = 0; i < size; i++) {
            const cellSize = bottomStructure.getLevelCellSize(level, i);
            column.getStructure().getCellSizes().push(cellSize);
          }
        }
      }
      tableInfo.countTotalLineSize(this.bottomColumn);
    }
  }

  /**
   * 添加数据
   */
  public addData(tableData: TableData<T>, addData: T[], isFoot: boolean): void {
    try {
      const size = tableData.getLineSize();
      if (isFoot) {
        tableData.getT().push(...addData);
      } else {
        tableData.getT().unshift(...addData);
      }
      const tableInfo = tableData.getTableInfo();
      tableInfo.addLine(addData.length, isFoot);
      tableData.clearCellRangeAddresses();
      let i = 0;
      for (const column of tableData.getChildColumns()) {
        column.addData(addData, size, isFoot);
        const ranges = column.parseRanges();
        if (ranges && ranges.length > 0) {
          for (const range of ranges) {
            tableData.addCellRange(new CellRange(range[0], range[1], i, i));
          }
        }
        i++;
      }
      this.calculateArrayCellSize(tableInfo, tableData.getChildColumns());
    } catch (e) {
      throw e;
    }
  }

  /**
   * 排序
   *
   * @param tableData 表格数据
   * @return
   */
  public sort(tableData: TableData<T>): Column[] {
    const sortColumn = tableData.getSortColumn();
    if (sortColumn) {
      const dataList = tableData.getT();
      dataList.sort((o1, o2) => {
        try {
          if (o1 === null) {
            return sortColumn.isReverseSort() ? 1 : -1;
          }
          if (o2 === null) {
            return sortColumn.isReverseSort() ? -1 : 1;
          }
          const data = sortColumn.getData(o1);
          const compareData = sortColumn.getData(o2);
          if (data === null) {
            return sortColumn.isReverseSort() ? 1 : -1;
          }
          if (compareData === null) {
            return sortColumn.isReverseSort() ? -1 : 1;
          }
          let compare;
          if (sortColumn.getComparator()) {
            compare = sortColumn.getComparator().compare(data, compareData);
            return sortColumn.isReverseSort() ? -compare : compare;
          } else {
            if (data instanceof Comparable) {
              compare = data.compareTo(compareData);
              return sortColumn.isReverseSort() ? -compare : compare;
            }
            return 0;
          }
        } catch (e) {
          throw e;
        }
      });
    }
    return tableData.getColumns();
  }

  private getChildColumn(tableData: TableData<T>): number {
    let maxLevel = 0;
    for (const column of tableData.getColumns()) {
      const level = this.getColumnLevel(tableData, column, 0);
      if (level > maxLevel) {
        maxLevel = level;
      }
    }
    return maxLevel;
  }

  /**
   * 得到列的层级
   *
   * @param tableData 表格数据
   * @param column    列
   * @param level     层级
   * @return
   */
  private getColumnLevel(tableData: TableData<T>, column: Column, level: number): number {
    level++;
    if (column.isParent()) {
      const children = column.getChildren();
      let maxLevel = 0;
      for (const child of children) {
        const childLevel = this.getColumnLevel(tableData, child, level);
        if (maxLevel < childLevel) {
          maxLevel = childLevel;
          column.setLevel(maxLevel);
        }
      }
      level = maxLevel;
      return level;
    } else {
      tableData.getChildColumns().push(column);
      return level;
    }
  }
}
