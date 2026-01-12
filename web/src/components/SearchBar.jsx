import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, placeholder = "Search notebooks..." }) {
    const [query, setQuery] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
            />
            {query && (
                <button className="search-clear" onClick={handleClear}>
                    ×
                </button>
            )}
        </div>
    );
}

export default SearchBar;
