import { h, Component } from 'preact';

class Overlay extends Component {
  constructor(...args) {
    super(...args);
    // In Internet Explorer and Edge we can not rely on vector-effect="non-scaling-stroke"
    // to maintain constant the witdh of the SVG strokes during zoom
    const vectorEffectNotAvailable = document.documentElement.style.vectorEffect === undefined;
    // last element is used for name, remove it with slice
    const standardRender = (el) => h(...el.slice(0, -1));
    const renderForIeAndEdge = (el, model) => {
      const newEl = el.slice(0, -1);
      const baseWidth = 3;
      let percentWidth;
      const totalImageWidthInPixels = model.width * model.zoom;
      if (totalImageWidthInPixels === 0) { percentWidth = 0; } // image not yet initialized
      percentWidth = (baseWidth * 100) / totalImageWidthInPixels;
      newEl[1]['stroke-width'] = percentWidth;
      return h(...newEl);
    };
    this.renderElement = vectorEffectNotAvailable ? renderForIeAndEdge : standardRender;
  }

  getInitialState() {
    return this.props.model;
  }

  componentDidMount() {
    this.props.model.addHandler('CHANGE_EVENT', () => {
      this.setState(this.props.model);
    });
  }

  onMouseDown = (e) => {
    if (this.handleMouseForAnnotation()) {
      e.stopPropagation();
      this.props.dispatch({ type: 'PRESS', ...this.calculateCoords(e) });
    }
  };

  onDblClick = (e) => {
    if (this.handleMouseForAnnotation()) {
      e.stopPropagation();
      this.props.dispatch({ type: 'DOUBLE_CLICK', ...this.calculateCoords(e) });
    }
  };

  onMouseMove = (e) => {
    if (this.handleMouseForAnnotation()) {
      e.stopPropagation();
      this.props.dispatch({ type: 'MOVE', ...this.calculateCoords(e) });
    }
  };

  onMouseUp = (e) => {
    if (this.handleMouseForAnnotation()) {
      e.stopPropagation();
      this.props.dispatch({ type: 'RELEASE' });
    }
  };

  onMouseLeave = (e) => {
    if (this.handleMouseForAnnotation()) {
      e.stopPropagation();
      this.props.dispatch({ type: 'LEAVE_CANVAS' });
    }
  };

  handleMouseForAnnotation() {
    return this.state.mode !== 'MOVE' && this.props.model.controlsactive;
  }

  calculateCoords(e) {
    const rect = this.base.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const x = (100 * offsetX) / rect.width;
    const y = (100 * offsetY) / rect.height;
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  }

  render() {
    const { onMouseDown, onMouseLeave, onMouseMove, onMouseUp, onDblClick } = this;
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        version: '1.1',
        preserveAspectRatio: 'none',
        viewBox: '0 0 100 100',
        width: '100%',
        height: '100%',
        style: {
          cursor: 'default',
          'background-color': 'rgba(0,0,0,0)', // IE 9-10 fix
        },
        onMouseDown,
        onMouseLeave,
        onMouseMove,
        onMouseUp,
        onDblClick,
        onPointerDown: onMouseDown,
        onPointerUp: onMouseUp,
      },
      (typeof this.state.annotations !== 'undefined') ? this.state.annotations.map((el) => this.renderElement(el, this.state)) : undefined,
    );
  }
}

export default Overlay;
