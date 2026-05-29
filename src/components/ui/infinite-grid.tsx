"use client";

import {
  Component,
  createRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
  type TouchEvent as ReactTouchEvent,
} from "react";

// Grid physics constants
const MIN_VELOCITY = 0.2;
const UPDATE_INTERVAL = 16;
const VELOCITY_HISTORY_SIZE = 5;
const FRICTION = 0.9;
const VELOCITY_THRESHOLD = 0.3;
const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const WHEEL_ZOOM_SENSITIVITY = 0.0025;

function clampScale(s: number): number {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
}

function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  const debouncedFn = function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = undefined;
    }, wait);
  };
  debouncedFn.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };
  return debouncedFn;
}

function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {},
) {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  const { leading = true, trailing = true } = options;

  const throttledFn = function (...args: Parameters<T>) {
    const now = Date.now();
    if (!lastCall && !leading) lastCall = now;
    const remaining = limit - (now - lastCall);
    if (remaining <= 0 || remaining > limit) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
      lastCall = now;
      func(...args);
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastCall = leading ? Date.now() : 0;
        timeoutId = undefined;
        func(...args);
      }, remaining);
    }
  };
  throttledFn.cancel = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };
  return throttledFn;
}

function getDistance(p1: Position, p2: Position) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

type Position = { x: number; y: number };
type GridItem = { position: Position; gridIndex: number };

type PinchSession = {
  startDistance: number;
  startScale: number;
  startOffset: Position;
  midpoint: Position; // container-relative
};

type State = {
  offset: Position;
  scale: number;
  isDragging: boolean;
  startPos: Position;
  restPos: Position;
  velocity: Position;
  gridItems: GridItem[];
  isMoving: boolean;
  lastMoveTime: number;
  velocityHistory: Position[];
  pinch: PinchSession | null;
};

export type GridItemConfig = {
  isMoving: boolean;
  position: Position;
  gridIndex: number;
};

export type InfiniteGridProps = {
  cellWidth: number;
  cellHeight: number;
  renderItem: (itemConfig: GridItemConfig) => ReactNode;
  className?: string;
  initialPosition?: Position;
  /**
   * Map a grid position to an item index. Return `null` to mark a position as
   * empty (it will not be rendered). Omit to use the default infinite spiral
   * layout.
   */
  getIndexForPosition?: (x: number, y: number) => number | null;
};

export class InfiniteGrid extends Component<InfiniteGridProps, State> {
  private containerRef: RefObject<HTMLElement | null>;
  private lastPos: Position;
  private animationFrame: number | null;
  private isComponentMounted: boolean;
  private lastUpdateTime: number;
  private debouncedUpdateGridItems: ReturnType<typeof throttle>;
  private resizeObserver: ResizeObserver | null = null;

  constructor(props: InfiniteGridProps) {
    super(props);
    const offset = this.props.initialPosition ?? { x: 0, y: 0 };
    this.state = {
      offset: { ...offset },
      scale: 1,
      restPos: { ...offset },
      startPos: { ...offset },
      velocity: { x: 0, y: 0 },
      isDragging: false,
      gridItems: [],
      isMoving: false,
      lastMoveTime: 0,
      velocityHistory: [],
      pinch: null,
    };
    this.containerRef = createRef();
    this.lastPos = { x: 0, y: 0 };
    this.animationFrame = null;
    this.isComponentMounted = false;
    this.lastUpdateTime = 0;
    this.debouncedUpdateGridItems = throttle(
      this.updateGridItems,
      UPDATE_INTERVAL,
      { leading: true, trailing: true },
    );
  }

  componentDidMount() {
    this.isComponentMounted = true;
    this.updateGridItems();
    const el = this.containerRef.current;
    if (el) {
      this.resizeObserver = new ResizeObserver(() => this.updateGridItems());
      this.resizeObserver.observe(el);
      el.addEventListener("wheel", this.handleWheel, { passive: false });
      el.addEventListener("touchmove", this.handleTouchMove, {
        passive: false,
      });
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.debouncedUpdateGridItems.cancel();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.containerRef.current) {
      this.containerRef.current.removeEventListener("wheel", this.handleWheel);
      this.containerRef.current.removeEventListener(
        "touchmove",
        this.handleTouchMove,
      );
    }
  }

  private calculateVisiblePositions = (): Position[] => {
    if (!this.containerRef.current) return [];
    const rect = this.containerRef.current.getBoundingClientRect();
    const { cellWidth, cellHeight } = this.props;
    const { scale, offset } = this.state;
    const width = rect.width;
    const height = rect.height;
    const effectiveW = cellWidth * scale;
    const effectiveH = cellHeight * scale;
    const cellsX = Math.max(1, Math.ceil(width / effectiveW));
    const cellsY = Math.max(1, Math.ceil(height / effectiveH));
    // Grid coord at the center of the viewport, accounting for the scaling
    // applied around the inner div's top-left origin.
    const centerX = Math.round(
      ((width / 2) * (1 - scale) - offset.x) / effectiveW,
    );
    const centerY = Math.round(
      ((height / 2) * (1 - scale) - offset.y) / effectiveH,
    );
    const positions: Position[] = [];
    const halfCellsX = Math.ceil(cellsX / 2) + 1;
    const halfCellsY = Math.ceil(cellsY / 2) + 1;
    for (let y = centerY - halfCellsY; y <= centerY + halfCellsY; y++) {
      for (let x = centerX - halfCellsX; x <= centerX + halfCellsX; x++) {
        positions.push({ x, y });
      }
    }
    return positions;
  };

  // Zoom around a screen point (in container-relative coordinates).
  private zoomAround = (point: Position, newScale: number) => {
    const { scale: oldScale, offset } = this.state;
    const clamped = clampScale(newScale);
    if (clamped === oldScale) return;
    const factor = clamped / oldScale;
    this.setState(
      {
        scale: clamped,
        offset: {
          x: point.x - (point.x - offset.x) * factor,
          y: point.y - (point.y - offset.y) * factor,
        },
        velocity: { x: 0, y: 0 },
      },
      this.debouncedUpdateGridItems,
    );
  };

  private getItemIndexForPosition = (x: number, y: number): number => {
    if (x === 0 && y === 0) return 0;
    const layer = Math.max(Math.abs(x), Math.abs(y));
    const innerLayersSize = Math.pow(2 * layer - 1, 2);
    let positionInLayer = 0;
    if (y === 0 && x === layer) positionInLayer = 0;
    else if (y < 0 && x === layer) positionInLayer = -y;
    else if (y === -layer && x > -layer) positionInLayer = layer + (layer - x);
    else if (x === -layer && y < layer)
      positionInLayer = 3 * layer + (layer + y);
    else if (y === layer && x < layer)
      positionInLayer = 5 * layer + (layer + x);
    else positionInLayer = 7 * layer + (layer - y);
    return innerLayersSize + positionInLayer;
  };

  private debouncedStopMoving = debounce(() => {
    this.setState({ isMoving: false, restPos: { ...this.state.offset } });
  }, 200);

  private updateGridItems = () => {
    if (!this.isComponentMounted) return;
    const positions = this.calculateVisiblePositions();
    const indexer = this.props.getIndexForPosition;
    const newItems: GridItem[] = [];
    for (const position of positions) {
      const gridIndex = indexer
        ? indexer(position.x, position.y)
        : this.getItemIndexForPosition(position.x, position.y);
      if (gridIndex === null) continue;
      newItems.push({ position, gridIndex });
    }
    const distanceFromRest = getDistance(this.state.offset, this.state.restPos);
    this.setState({ gridItems: newItems, isMoving: distanceFromRest > 5 });
    this.debouncedStopMoving();
  };

  private animate = () => {
    if (!this.isComponentMounted) return;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    if (deltaTime >= UPDATE_INTERVAL) {
      const { velocity } = this.state;
      const speed = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y,
      );
      if (speed < MIN_VELOCITY) {
        this.setState({ velocity: { x: 0, y: 0 } });
        return;
      }
      let deceleration = FRICTION;
      if (speed < VELOCITY_THRESHOLD) {
        deceleration = FRICTION * (speed / VELOCITY_THRESHOLD);
      }
      this.setState(
        (prevState) => ({
          offset: {
            x: prevState.offset.x + prevState.velocity.x,
            y: prevState.offset.y + prevState.velocity.y,
          },
          velocity: {
            x: prevState.velocity.x * deceleration,
            y: prevState.velocity.y * deceleration,
          },
        }),
        this.debouncedUpdateGridItems,
      );
      this.lastUpdateTime = currentTime;
    }
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private handleDown = (p: Position) => {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.setState({
      isDragging: true,
      startPos: {
        x: p.x - this.state.offset.x,
        y: p.y - this.state.offset.y,
      },
      velocity: { x: 0, y: 0 },
    });
    this.lastPos = { x: p.x, y: p.y };
  };

  private handleMove = (p: Position) => {
    if (!this.state.isDragging) return;
    const currentTime = performance.now();
    const timeDelta = currentTime - this.state.lastMoveTime;
    const rawVelocity = {
      x: (p.x - this.lastPos.x) / (timeDelta || 1),
      y: (p.y - this.lastPos.y) / (timeDelta || 1),
    };
    const velocityHistory = [...this.state.velocityHistory, rawVelocity];
    if (velocityHistory.length > VELOCITY_HISTORY_SIZE) velocityHistory.shift();
    const smoothedVelocity = velocityHistory.reduce(
      (acc, vel) => ({
        x: acc.x + vel.x / velocityHistory.length,
        y: acc.y + vel.y / velocityHistory.length,
      }),
      { x: 0, y: 0 },
    );
    this.setState(
      {
        velocity: smoothedVelocity,
        offset: {
          x: p.x - this.state.startPos.x,
          y: p.y - this.state.startPos.y,
        },
        lastMoveTime: currentTime,
        velocityHistory,
      },
      this.updateGridItems,
    );
    this.lastPos = { x: p.x, y: p.y };
  };

  private handleUp = () => {
    this.setState({ isDragging: false });
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private handleMouseDown = (e: ReactMouseEvent) =>
    this.handleDown({ x: e.clientX, y: e.clientY });

  private handleMouseMove = (e: ReactMouseEvent) => {
    if (this.state.isDragging) e.preventDefault();
    this.handleMove({ x: e.clientX, y: e.clientY });
  };

  private handleMouseUp = () => this.handleUp();

  private containerPoint = (clientX: number, clientY: number): Position => {
    const rect = this.containerRef.current?.getBoundingClientRect();
    return {
      x: clientX - (rect?.left ?? 0),
      y: clientY - (rect?.top ?? 0),
    };
  };

  private handleTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length >= 2) {
      // Begin pinch session — cancel any in-flight pan.
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;
      const startDistance = Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY,
      );
      const midpoint = this.containerPoint(
        (t1.clientX + t2.clientX) / 2,
        (t1.clientY + t2.clientY) / 2,
      );
      this.setState({
        isDragging: false,
        velocity: { x: 0, y: 0 },
        pinch: {
          startDistance,
          startScale: this.state.scale,
          startOffset: { ...this.state.offset },
          midpoint,
        },
      });
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    this.handleDown({ x: touch.clientX, y: touch.clientY });
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length >= 2 && this.state.pinch) {
      e.preventDefault();
      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;
      const newDistance = Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY,
      );
      const { startDistance, startScale, startOffset, midpoint } =
        this.state.pinch;
      const ratio = newDistance / (startDistance || 1);
      const newScale = clampScale(startScale * ratio);
      const factor = newScale / startScale;
      this.setState(
        {
          scale: newScale,
          offset: {
            x: midpoint.x - (midpoint.x - startOffset.x) * factor,
            y: midpoint.y - (midpoint.y - startOffset.y) * factor,
          },
        },
        this.updateGridItems,
      );
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    this.handleMove({ x: touch.clientX, y: touch.clientY });
  };

  private handleTouchEnd = (e: ReactTouchEvent) => {
    if (e.touches.length < 2 && this.state.pinch) {
      // Pinch ended (one or zero fingers remaining). Don't promote the
      // remaining finger to a pan — wait for a fresh touchstart.
      this.setState({ pinch: null, isDragging: false });
      return;
    }
    this.handleUp();
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Ctrl/meta + wheel is the conventional zoom gesture; trackpad pinch on
    // Mac is also reported as a wheel event with ctrlKey === true.
    if (e.ctrlKey || e.metaKey) {
      const point = this.containerPoint(e.clientX, e.clientY);
      const newScale =
        this.state.scale * Math.exp(-e.deltaY * WHEEL_ZOOM_SENSITIVITY);
      this.zoomAround(point, newScale);
      return;
    }
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    this.setState(
      (prevState) => ({
        offset: {
          x: prevState.offset.x - deltaX,
          y: prevState.offset.y - deltaY,
        },
        velocity: { x: 0, y: 0 },
      }),
      this.debouncedUpdateGridItems,
    );
  };

  render() {
    const { offset, scale, isDragging, gridItems, isMoving } = this.state;
    const { cellWidth, cellHeight, className } = this.props;
    const containerRect = this.containerRef.current?.getBoundingClientRect();
    const containerWidth = containerRect?.width ?? 0;
    const containerHeight = containerRect?.height ?? 0;

    return (
      <div
        ref={this.containerRef as RefObject<HTMLDivElement>}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          touchAction: "none",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseUp}
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
        onTouchCancel={this.handleTouchEnd}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {gridItems.map((item) => {
            const x = item.position.x * cellWidth + containerWidth / 2;
            const y = item.position.y * cellHeight + containerHeight / 2;
            return (
              <div
                key={`${item.position.x}-${item.position.y}`}
                style={{
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  userSelect: "none",
                  width: cellWidth,
                  height: cellHeight,
                  transform: `translate3d(${x}px, ${y}px, 0)`,
                  marginLeft: `-${cellWidth / 2}px`,
                  marginTop: `-${cellHeight / 2}px`,
                  willChange: "transform",
                }}
              >
                {this.props.renderItem({
                  gridIndex: item.gridIndex,
                  position: item.position,
                  isMoving,
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
