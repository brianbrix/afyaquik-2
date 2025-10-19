import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Form, Button, ListGroup, Badge } from 'react-bootstrap';

interface SearchableMultiSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  maxHeight?: string;
}

export function SearchableMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Search and select...",
  label,
  disabled = false,
  maxHeight = "200px"
}: SearchableMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

  const handleClear = () => {
    onChange([]);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => setIsOpen(false), 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={containerRef}>
      {label && <Form.Label>{label}</Form.Label>}
      
      <div className="d-flex flex-wrap gap-1 mb-2">
        {value.map((item) => (
          <Badge key={item} bg="primary" className="d-flex align-items-center gap-1">
            {item}
            <Button
              variant="link"
              size="sm"
              className="p-0 text-white"
              onClick={() => handleRemove(item)}
              style={{ fontSize: '0.75rem', lineHeight: 1 }}
            >
              <i className="bi bi-x"></i>
            </Button>
          </Badge>
        ))}
      </div>

      <div className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          autoComplete="off"
        />
        {value.length > 0 && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            title="Clear all selections"
          >
            <i className="bi bi-x"></i>
          </Button>
        )}
      </div>

      {isOpen && (
        <div 
          className="position-absolute w-100 bg-white border rounded shadow-sm"
          style={{ zIndex: 1000, maxHeight, overflowY: 'auto' }}
        >
          <ListGroup variant="flush">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <ListGroup.Item
                  key={option}
                  action
                  onClick={() => handleOptionToggle(option)}
                  className={`d-flex align-items-center ${value.includes(option) ? 'bg-primary text-white' : ''}`}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      checked={value.includes(option)}
                      onChange={() => {}} // Handled by onClick
                    />
                    <span>{option}</span>
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="text-muted text-center">
                {searchQuery ? 'No options found' : 'No options available'}
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      )}
    </div>
  );
}
