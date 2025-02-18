export class ArrayStructure {
  private structureArray: Map<number, number[]>; // Structure
  private maxLevel: number = 0;
  private cellSizes: number[] = [];
  private _isEffective: boolean = false; // Whether it is effective

  constructor() {
    this.structureArray = new Map<number, number[]>();
  }

  /**
   * Put null object structure count
   * @param level
   * @param isFoot
   */
  public putNull(level: number, isFoot: boolean): void {
    if (this._isEffective && level <= this.maxLevel) {
      for (let i = level; i <= this.maxLevel; i++) {
        this.put(i, 1, isFoot);
      }
    }
  }

  /**
   * Put array count
   * @param level Level
   * @param arraySize Array size
   * @param isFoot Whether to insert at the end
   */
  public put(level: number, arraySize: number, isFoot: boolean): void {
    if (this._isEffective) {
      let structures = this.structureArray.get(level);
      if (!structures) {
        structures = [];
        this.structureArray.set(level, structures);
      }
      this.recordPerSizeList(structures, arraySize, isFoot);
    }
  }

  /**
   * Record the current array size count
   */
  private recordPerSizeList(structure: number[], size: number, isFoot: boolean): void {
    const perListSize = structure.length;
    if (perListSize === 0) {
      structure.push(size - 1);
    } else {
      const per: number = structure[perListSize - 1] as number;
      if (isFoot) {
        structure.push(per + size);
      } else {
        this.moveArrayPosition(structure, size);
        structure.unshift(size - 1);
      }
    }
  }

  /**
   * Move array structure count position
   * Inserting at the head requires moving
   */
  private moveArrayPosition(structure: number[], moveSize: number): void {
    structure.forEach((value, index) => {
      structure[index] = value + moveSize;
    });
  }

  /**
   * Clear
   */
  public clear(): void {
    this.structureArray.clear();
  }

  /**
   * Get the number of cells occupied at the specified level position
   * @param level Level
   * @param position Position
   * @return Number of cells occupied
   */
  public getLevelCellSize(level: number, position: number): number {
    if (this.maxLevel <= level) {
      return 1;
    }
    let startAndEnd = this.getPerStartAndEnd(level + 1, position);
    if (Array.isArray(startAndEnd)) {
      startAndEnd = this.getStartAndEnd(level + 2, startAndEnd[0] as number, startAndEnd[1] as number);
      return startAndEnd[1] - startAndEnd[0] + 1;
    }
    return 1;
  }

  private getStartAndEnd(level: number, start: number, end: number): number[] {
    if (this.structureArray.get(level)) {
      const starts = this.getPerStartAndEnd(level, start);
      const ends = this.getPerStartAndEnd(level, end);
      if (!starts || !ends) {
        return [start, end];
      }
      return this.getStartAndEnd(level + 1, starts[0] as number, ends[1] as number);
    }
    return [start, end];
  }

  private getPerStartAndEnd(level: number, position: number): number[] | null {
    const structures = this.structureArray.get(level);
    if (Array.isArray(structures) && structures.length > position) {
      const end = structures[position] as number;
      const start = position > 0 ? (structures[position - 1] as number) + 1 : 0;
      return [start, end];
    }
    return null;
  }

  /**
   * Get the number of cells occupied by the current structure position
   * @return Number of cells
   */
  public getCellSizes(): number[] {
    return this.cellSizes;
  }

  public setCellSizes(cellSizes: number[]): void {
    this.cellSizes = cellSizes;
  }

  /**
   * Get the maximum level saved
   */
  public getMaxLevel(): number {
    return this.maxLevel;
  }

  /**
   * Set the maximum level saved
   * @param maxLevel Maximum level
   */
  public setMaxLevel(maxLevel: number): void {
    this.maxLevel = maxLevel;
  }

  /**
   * Whether it is an effective data structure
   * @return Effective data structure
   */
  public isEffective(): boolean {
    return this._isEffective;
  }

  /**
   * Set whether it is an effective data structure
   */
  public setEffective(effective: boolean): void {
    this._isEffective = effective;
  }
}
