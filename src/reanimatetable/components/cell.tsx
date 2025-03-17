import React, { FC, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Icon } from "../../table/bean/Cell";
import { CanvasImpl } from '../../form/utils/Canvas';

interface CellProps {
  data: React.ReactNode;
  width?: number;
  height?: number;
  flex?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  borderStyle?: {
    borderColor?: string;
    borderWidth?: number;
  };
  icon?: Icon;
  onPress?: () => void;
}

export const Cell: FC<CellProps> = ({
  data,
  width,
  height,
  flex,
  style,
  textStyle,
  borderStyle,
  icon,
  onPress,
  ...props
}) => {
  const textDom = React.isValidElement(data) ? (
    data
  ) : (
    <Text style={StyleSheet.flatten([textStyle, styles.text])} {...props}>
      {data}
    </Text>
  );

  const borderTopWidth = borderStyle?.borderWidth ?? 0;
  const borderRightWidth = borderTopWidth;
  const borderColor = borderStyle?.borderColor ?? '#000';

  const composedStyles = useMemo(() => {
    const styles: ViewStyle = {};
    if (width) {
      styles.width = width;
    }
    if (height) {
      styles.height = height;
    }
    if (flex) {
      styles.flex = flex;
    }
    if (!width && !flex && !height && !style) {
      styles.flex = 1;
    }
    return styles;
  }, [width, height, flex, style]);

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={StyleSheet.flatten([
        {
          borderTopWidth,
          borderRightWidth,
          borderColor,
        },
        styles.cell,
        composedStyles,
        style,
      ])}
    >
      {icon ? (
        getContent(icon, textDom)
      ) : (
        textDom
      )}
    </TouchableOpacity>
  );
};

function getContent(icon: Icon, textDom: React.ReactNode) {
  console.log('icon = ', icon);
  switch (icon?.imageAlignment) {
    case Icon.LEFT:
      return (
        <View style={styles.row}>
          {getIcon(icon)}
          {textDom}
        </View>
      );
    case Icon.RIGHT:
      return (
        <View style={styles.row}>
          {textDom}
          {getIcon(icon)}
        </View>
      );
    case Icon.TOP:
      return (
        <View>
          {getIcon(icon)}
          {textDom}
        </View>
      );
    case Icon.BOTTOM:
      return (
        <View>
          {textDom}
          {getIcon(icon)}
        </View>
      );
    default:
      return textDom;
  }
}

function getIcon(icon: Icon) {
  return (
    <Image source={CanvasImpl.IMAGEMAP[icon.name]} style={{width: icon?.width, height: icon?.height, alignSelf: 'center'}} />
  )
}

const styles = StyleSheet.create({
  cell: { justifyContent: 'center' },
  text: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row'},
});
