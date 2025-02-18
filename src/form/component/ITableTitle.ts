import type { IComponent } from './IComponent';

/**
 * Created by huang on 2017/10/26.
 */
export interface ITableTitle extends IComponent<String> {
  getSize(): number;

  setSize(size: number): void;

  getDirection(): number;

  setDirection(direction: number): void;
}
