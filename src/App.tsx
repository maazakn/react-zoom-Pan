import "./styles.css";
import React from "react";
import usePrevious from "./usePrevious";

type position = { x: number; y: number };

type ScaleAtType = {
  at: position;
  amount: number;
};

type MousePositionType = {
  pos: position;
  button: boolean;
};

enum ZOOM_AMOUNT {
  IN = 1.1,
  OUT = 1 / 1.1
}

export default function App() {
  const zoomables = React.useRef(null);

  // effects
  const [scaleAtEffect, setScaleAtEffect] = React.useState<ScaleAtType>({
    at: { x: 0, y: 0 },
    amount: 1
  });
  const [panAmountEffect, setPanAmountEffect] = React.useState<position>({
    x: 0,
    y: 0
  });

  const [matrix, setMatrix] = React.useState<number[]>([1, 0, 0, 1, 0, 0]);
  const [scale, setScale] = React.useState<number>(1);
  const [pos, setPos] = React.useState<position>({ x: 0, y: 0 });
  const [dirty, setDirty] = React.useState<boolean>(true);
  const [mouseMove, setMouseMove] = React.useState<MousePositionType>({
    pos: { x: 0, y: 0 },
    button: false
  });
  const prev = usePrevious<MousePositionType>(mouseMove);

  // update Effect
  React.useEffect(() => {
    if (dirty) {
      let m = [...matrix];
      m[3] = m[0] = scale;
      m[2] = m[1] = 0;
      m[4] = pos.x;
      m[5] = pos.y;

      setMatrix(m);
    }
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, pos]);

  // scaleAt Effect
  React.useEffect(() => {
    const { amount, at } = scaleAtEffect;

    setScale((prevScale) => prevScale * scaleAtEffect.amount);
    setPos({
      x: at.x - (at.x - pos.x) * amount,
      y: at.y - (at.y - pos.y) * amount
    });

    setDirty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaleAtEffect]);

  // transform effect
  React.useEffect(() => {
    const m = matrix;
    const element = zoomables.current as any;
    element.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
  }, [matrix]);

  // Pan effect
  React.useEffect(() => {
    const panAmount = panAmountEffect;

    setPos((prevPos) => ({
      x: prevPos.x + panAmount.x,
      y: prevPos.y + panAmount.y
    }));
    setDirty(true);
  }, [panAmountEffect]);

  // mouseMove effect
  React.useEffect(() => {
    if (mouseMove.button && prev) {
      // Perform your panning logic here
      setPanAmountEffect({
        x: mouseMove.pos.x - prev.pos.x,
        y: mouseMove.pos.y - prev.pos.y
      });
    }
  }, [mouseMove, prev]);

  function handleMouseEvent(event: MouseEvent) {
    if (event.type === "mousedown") {
      setMouseMove((p) => ({
        ...p,
        button: true
      }));
    }

    if (event.type === "mouseup" || event.type === "mouseout") {
      setMouseMove((p) => ({
        ...p,
        button: false
      }));
    }

    setMouseMove((p) => ({
      ...p,
      pos: { x: event.pageX, y: event.pageY }
    }));

    event.preventDefault();
  }

  function handleMouseWheelEvent(event: WheelEvent) {
    const zoomMe = zoomables.current as any;
    const x = event.pageX - zoomMe?.clientWidth / 2;
    const y = event.pageY - zoomMe?.clientHeight / 2;

    if (event.ctrlKey) {
      if (event.deltaY < 0)
        setScaleAtEffect({ at: { x, y }, amount: ZOOM_AMOUNT.IN });
      else setScaleAtEffect({ at: { x, y }, amount: ZOOM_AMOUNT.OUT });
    } else if (event.shiftKey) {
      setPanAmountEffect({ x: -event.deltaY, y: 0 });
    } else {
      setPanAmountEffect({ x: -event.deltaX, y: -event.deltaY });
    }

    event.preventDefault();
  }

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseEvent, {
      passive: false
    });
    document.addEventListener("mousedown", handleMouseEvent, {
      passive: false
    });
    document.addEventListener("mouseup", handleMouseEvent, { passive: false });
    document.addEventListener("mouseout", handleMouseEvent, { passive: false });
    document.addEventListener("wheel", handleMouseWheelEvent, {
      passive: false
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseEvent);
      document.removeEventListener("mousedown", handleMouseEvent);
      document.removeEventListener("mouseup", handleMouseEvent);
      document.removeEventListener("mouseout", handleMouseEvent);
      document.removeEventListener("wheel", handleMouseWheelEvent);
    };
  }, []);

  return (
    <main className="layout">
      <div
        ref={zoomables}
        style={{
          background: "darkorchid",
          position: "absolute",
          top: 0,
          left: 0
        }}
      >
        <img alt="img" src="https://i.stack.imgur.com/C7qq2.png?s=328&g=1" />

        <img alt="img" src="https://i.stack.imgur.com/C7qq2.png?s=328&g=1" />

        <img alt="img" src="https://i.stack.imgur.com/C7qq2.png?s=328&g=1" />
      </div>
    </main>
  );
}
