import './Toolbar.css';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#ffffff', '#000000'
];

function Toolbar({
  currentTool, setCurrentTool,
  currentColor, setCurrentColor,
  brushSize, setBrushSize,
  onClear, onUndo
}) {
  return (
    <div className="drawing-toolbar">
      {/* Tools Section */}
      <div className="toolbar-section">
        <span className="toolbar-label">Tools</span>
        <div className="tool-buttons">
          <button
            className={`tool-btn ${currentTool === 'pen' ? 'active' : ''}`}
            onClick={() => setCurrentTool('pen')}
            title="Pen"
          >
            ✏️
          </button>
          <button
            className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
            onClick={() => setCurrentTool('eraser')}
            title="Eraser"
          >
            🧹
          </button>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      {/* Shapes Section */}
      <div className="toolbar-section">
        <span className="toolbar-label">Shapes</span>
        <div className="tool-buttons">
          <button
            className={`tool-btn ${currentTool === 'line' ? 'active' : ''}`}
            onClick={() => setCurrentTool('line')}
            title="Line"
          >
            ╱
          </button>
          <button
            className={`tool-btn ${currentTool === 'rectangle' ? 'active' : ''}`}
            onClick={() => setCurrentTool('rectangle')}
            title="Rectangle"
          >
            ▢
          </button>
          <button
            className={`tool-btn ${currentTool === 'circle' ? 'active' : ''}`}
            onClick={() => setCurrentTool('circle')}
            title="Circle"
          >
            ○
          </button>
          <button
            className={`tool-btn ${currentTool === 'arrow' ? 'active' : ''}`}
            onClick={() => setCurrentTool('arrow')}
            title="Arrow"
          >
            →
          </button>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      {/* Color Section */}
      <div className="toolbar-section">
        <span className="toolbar-label">Color</span>
        <div className="color-picker">
          {COLORS.map(color => (
            <button
              key={color}
              className={`color-btn ${currentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-divider"></div>

      {/* Size Section */}
      <div className="toolbar-section">
        <span className="toolbar-label">Size: {brushSize}px</span>
        <input
          type="range"
          className="size-slider"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
      </div>

      <div className="toolbar-divider"></div>

      {/* Actions Section */}
      <div className="toolbar-section">
        <span className="toolbar-label">Actions</span>
        <div className="tool-buttons">
          <button className="tool-btn" onClick={onUndo} title="Undo">
            ↩️
          </button>
          <button className="tool-btn danger" onClick={onClear} title="Clear All">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
