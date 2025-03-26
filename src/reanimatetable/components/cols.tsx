import React, { FC } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Cell } from './cell';
import { sum } from '../utils';
import type { Icon } from '../../table/bean/Cell';

interface ColProps {
  data: any[];
  icons?: (Icon | undefined)[];
  onPressFuncs?: (() => void | undefined)[];
  style?: StyleProp<ViewStyle>;
  width?: number;
  heightArr?: number[];
  flex?: number;
  textStyle?: StyleProp<TextStyle>;
  textStyleArr?: StyleProp<TextStyle>[];
}

export const Col: FC<ColProps> = ({ data, style, width, heightArr, flex, textStyle,
  icons, onPressFuncs, textStyleArr, ...props }) => {
  return data ? (
    <View style={StyleSheet.flatten([{ width: width ?? (flex ? undefined : 1), flex }, style])}>
      {data.map((item, i) => {
        const height = heightArr?.[i];
        return (
          <Cell key={i} data={item}
          icon={icons?.[i]} onPress={onPressFuncs?.[i]} width={width} height={height} textStyle={textStyleArr?.[i] || textStyle} {...props} />
        );
      })}
    </View>
  ) : null;
};

interface ColsProps {
  data: any[][];
  icons?: (Icon | undefined)[][];
  onPressFuncs?: (() => void | undefined)[][];
  style?: StyleProp<ViewStyle>;
  widthArr?: number[];
  heightArr?: number[];
  flexArr?: number[];
  textStyle?: StyleProp<TextStyle>;
}

export const Cols: FC<ColsProps> = ({ data, style, widthArr, heightArr, flexArr, textStyle,
  icons, onPressFuncs, ...props }) => {
  const width = widthArr ? sum(widthArr) : 0;

  return data ? (
    <View style={StyleSheet.flatten([styles.cols, width ? { width } : {}])}>
      {data.map((item, i) => {
        const flex = flexArr?.[i];
        const wth = widthArr?.[i];
        return (
          <Col
            key={i}
            data={item}
            icons={icons?.[i]}
            onPressFuncs={onPressFuncs?.[i]}
            width={wth}
            heightArr={heightArr}
            flex={flex}
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
  cols: { flexDirection: 'row' },
});
