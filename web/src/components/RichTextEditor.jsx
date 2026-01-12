import { useRef, useCallback, useEffect, useState } from 'react';
import './RichTextEditor.css';

const TEXT_COLORS = ['#ffffff', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
const HIGHLIGHT_COLORS = ['transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fecdd3'];

function RichTextEditor({ content, onChange }) {
    const editorRef = useRef(null);
    const lastContentRef = useRef(''); // Track last content to detect remote updates
    const isTypingRef = useRef(false); // Track if user is currently typing
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    // Update content when it changes from external source (socket)
    useEffect(() => {
        if (editorRef.current && content !== undefined) {
            // Only update if it's a remote change (content differs from what we last sent)
            if (content !== lastContentRef.current && !isTypingRef.current) {
                editorRef.current.innerHTML = content;
                lastContentRef.current = content;
            }
        }
    }, [content]);

    const formatText = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            lastContentRef.current = newContent; // Track what we're sending
            isTypingRef.current = true; // Mark that we're typing
            onChange(newContent);

            // Reset typing flag after a short delay
            setTimeout(() => {
                isTypingRef.current = false;
            }, 100);
        }
    }, [onChange]);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    }, []);

    const setTextColor = (color) => {
        formatText('foreColor', color);
        setShowColorPicker(false);
    };

    const setHighlight = (color) => {
        formatText('hiliteColor', color);
        setShowHighlightPicker(false);
    };

    const insertLink = () => {
        if (linkUrl) {
            formatText('createLink', linkUrl);
            setLinkUrl('');
        }
        setShowLinkInput(false);
    };

    const insertCodeBlock = () => {
        document.execCommand('insertHTML', false, '<pre><code>// Your code here</code></pre>');
        editorRef.current?.focus();
    };

    return (
        <div className="rich-editor">
            <div className="editor-toolbar">
                {/* Headings */}
                <div className="toolbar-group">
                    <button className="toolbar-btn" onClick={() => formatText('formatBlock', '<h1>')} title="Heading 1">H1</button>
                    <button className="toolbar-btn" onClick={() => formatText('formatBlock', '<h2>')} title="Heading 2">H2</button>
                    <button className="toolbar-btn" onClick={() => formatText('formatBlock', '<h3>')} title="Heading 3">H3</button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Basic Formatting */}
                <div className="toolbar-group">
                    <button className="toolbar-btn" onClick={() => formatText('bold')} title="Bold"><b>B</b></button>
                    <button className="toolbar-btn" onClick={() => formatText('italic')} title="Italic"><i>I</i></button>
                    <button className="toolbar-btn" onClick={() => formatText('underline')} title="Underline"><u>U</u></button>
                    <button className="toolbar-btn" onClick={() => formatText('strikeThrough')} title="Strikethrough"><s>S</s></button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Colors */}
                <div className="toolbar-group">
                    <div className="toolbar-dropdown">
                        <button className="toolbar-btn" onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color">
                            🎨
                        </button>
                        {showColorPicker && (
                            <div className="dropdown-menu color-menu">
                                {TEXT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className="color-option"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setTextColor(color)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="toolbar-dropdown">
                        <button className="toolbar-btn" onClick={() => setShowHighlightPicker(!showHighlightPicker)} title="Highlight">
                            🖍️
                        </button>
                        {showHighlightPicker && (
                            <div className="dropdown-menu color-menu">
                                {HIGHLIGHT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className="color-option highlight-option"
                                        style={{ backgroundColor: color === 'transparent' ? '#333' : color }}
                                        onClick={() => setHighlight(color)}
                                    >
                                        {color === 'transparent' && '✕'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="toolbar-divider"></div>

                {/* Lists & Quote */}
                <div className="toolbar-group">
                    <button className="toolbar-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List">•</button>
                    <button className="toolbar-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List">1.</button>
                    <button className="toolbar-btn" onClick={() => formatText('formatBlock', '<blockquote>')} title="Quote">"</button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Link & Code */}
                <div className="toolbar-group">
                    <div className="toolbar-dropdown">
                        <button className="toolbar-btn" onClick={() => setShowLinkInput(!showLinkInput)} title="Insert Link">
                            🔗
                        </button>
                        {showLinkInput && (
                            <div className="dropdown-menu link-menu">
                                <input
                                    type="url"
                                    className="link-input"
                                    placeholder="https://..."
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                                />
                                <button className="link-btn" onClick={insertLink}>Add</button>
                            </div>
                        )}
                    </div>
                    <button className="toolbar-btn" onClick={insertCodeBlock} title="Code Block">
                        {'</>'}
                    </button>
                </div>
            </div>

            <div
                ref={editorRef}
                className="editor-content"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onPaste={handlePaste}
                data-placeholder="Start typing your notes..."
            />
        </div>
    );
}

export default RichTextEditor;
