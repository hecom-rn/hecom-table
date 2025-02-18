import { init, registerPainter } from 'zrender';
import Rect from 'zrender/lib/graphic/shape/Rect';
import LinearGradient from 'zrender/lib/graphic/LinearGradient';
import SvgChart from './svg/svgChart';
import { CustomSVGPainter } from './svg/SVGRenderer';
import { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';

export * from './types';

registerPainter('svg', CustomSVGPainter);

interface TableProps {
  style: ViewStyle;
}

export default function Table(props: TableProps) {
  const zrRef = useRef(null); // 用于存储 ZRender 实例
  const containerRef = useRef(null); // 用于存储 DOM 容器
  useEffect(() => {
    // 初始化 ZRender 实例
    const zr = init(containerRef.current, { renderer: 'svg' });

    zrRef.current = zr;

    const lg = new LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'red' },
      { offset: 1, color: 'blue' },
    ]);
    const rect = new Rect({
      draggable: true,
      shape: { x: 10, y: 10, width: 100, height: 100 },
      style: { fill: lg },
    });
    zr.add(rect);
    return () => {
      zr.dispose(); // 组件卸载时销毁 ZRender 实例
    };
  }, []);
  return <SvgChart ref={containerRef} {...props} useRNGH />;
}
