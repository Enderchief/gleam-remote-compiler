import { createEffect, type JSXElement } from 'solid-js';

/**
 * Split Component for SolidJS
 */
export default function SplitContainer(props: {
  children: [JSXElement, JSXElement];
  orientation: 'horizontal' | 'vertical';
  class?: string;
  onresize?: (size: { height: number; width: number }) => void;
  gutterSize?: number;
}) {
  const gutterSize = props.gutterSize || 2;
  const [start, end] = convert(...props.children);

  function onMouseMove(e: MouseEvent) {
    console.log(e, element.offsetHeight, element.getClientRects()[0]?.height);

    const w = element.offsetWidth;

    if (e.clientX <= 200 || e.clientX >= w - 600) return console.log('NOPE');
    const fr = e.clientX / w;

    const template = `${fr}fr ${gutterSize}px ${1 - fr}fr`;
    console.log(template, e.clientX, fr, element.offsetHeight);
    element.style.gridTemplateColumns = template;

    props.onresize &&
      props.onresize({
        width: w - e.clientX - gutterSize,
        height: start.offsetHeight,
      });
  }
  function mousedown(ev: MouseEvent) {
    ev.preventDefault();

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  const gutter = (
    <div
      onmousedown={mousedown}
      class='h-100% bg-[#ccc] cursor-ew-resize w-[10px]'
      draggable='true'
    ></div>
  );

  const element = (
    <div
      style={{ 'grid-template-columns': '1fr 10px 1fr' }}
      class={`${props.class} grid`}
    >
      {start}
      {gutter}
      {end}
    </div>
  ) as HTMLDivElement;

  createEffect(() => onMouseMove({ clientX: 250 } as any));

  return element;
}

function convert(
  ...children: [JSXElement, JSXElement]
): [HTMLElement, HTMLElement] {
  // @ts-ignore
  return children.map((v) => {
    switch (typeof v) {
      case 'function':
        // @ts-ignore
        return v() as HTMLElement;
      case 'object':
        return v as HTMLElement;
      default:
        return v as any as HTMLElement;
    }
  });
}
