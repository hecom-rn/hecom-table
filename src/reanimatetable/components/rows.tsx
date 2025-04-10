import React, { FC, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Cell } from './cell';
import { sum } from '../utils';
import type { Icon } from '../../table/bean/Cell';

interface RowProps {
  data: any[];
  icons?: (Icon | undefined)[];
  onPressFuncs?: (() => void | undefined)[];
  style?: StyleProp<ViewStyle>;
  widthArr?: number[];
  height?: number;
  flexArr?: number[];
  textStyle?: StyleProp<TextStyle>;
  cellTextStyle?: (item: any) => StyleProp<TextStyle>;
}

export const Row: FC<RowProps> = ({
  data,
  style,
  widthArr,
  height,
  flexArr,
  textStyle,
  cellTextStyle,
  icons,
  onPressFuncs,
  ...props
}) => {
  const width = widthArr ? sum(widthArr) : 0;

  const composedStyle = useMemo(() => {
    const styles: ViewStyle = {};
    if (width) {
      styles.width = width;
    }
    if (height) {
      styles.height = height;
    }
    return styles;
  }, [width, height]);

  return data ? (
    <View style={StyleSheet.flatten([composedStyle, styles.row, style])}>
      {data.map((item, i) => {
        const flex = flexArr?.[i];
        const wth = widthArr?.[i];
        return (
          <Cell
            key={i}
            data={item}
            icon={icons?.[i]}
            onPress={onPressFuncs?.[i]}
            width={wth}
            height={height}
            flex={flex}
            textStyle={StyleSheet.flatten([
              cellTextStyle && cellTextStyle(item),
              textStyle,
            ])}
            {...props}
          />
        );
      })}
    </View>
  ) : null;
};

interface RowsProps {
  data: any[][];
  icons?: (Icon | undefined)[][];
  onPressFuncs?: (() => void | undefined)[][];
  style?: StyleProp<ViewStyle>;
  widthArr?: number[];
  heightArr?: number[];
  flexArr?: number[];
  textStyle?: StyleProp<TextStyle>;
}

export const Rows: FC<RowsProps> = ({
  data,
  style,
  widthArr,
  heightArr,
  flexArr,
  textStyle,
  icons,
  onPressFuncs,
  ...props
}) => {
  const flex = flexArr ? sum(flexArr) : 0;
  const width = widthArr ? sum(widthArr) : 0;

  const composedStyle = useMemo(() => {
    const styles: ViewStyle = {}
    if (flex) {
      styles.flex = flex
    }
    if (width) {
      styles.width = width
    }
    return styles
  }, [flex, width])

  return data ? (
    <View style={composedStyle}>
      {data.map((item, i) => {
        const height = heightArr?.[i];
        return (
          <Row
            key={i}
            data={item}
            icons={icons?.[i]}
            onPressFuncs={onPressFuncs?.[i]}
            widthArr={widthArr}
            height={height}
            flexArr={flexArr}
            style={style}
            textStyle={textStyle}
            {...props}
          />
        );
      })}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
});
