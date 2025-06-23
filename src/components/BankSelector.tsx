import React, { useState, useRef, useEffect } from 'react';
import { Building, ChevronDown, Search } from 'lucide-react';
import { searchBanks, getBankByName, USBank } from '../data/usBanks';

interface BankSelectorProps {
  value: string;
  onChange: (bankName: string, routingNumber?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BankSelector({ value, onChange, placeholder = "Search for a bank...", disabled, className }: BankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredBanks, setFilteredBanks] = useState<USBank[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchBanks(searchQuery);
      setFilteredBanks(results);
      setHighlightedIndex(-1);
    } else {
      setFilteredBanks([]);
      setHighlightedIndex(-1);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    onChange(query);
  };

  const handleBankSelect = (bank: USBank) => {
    setSearchQuery(bank.name);
    setIsOpen(false);
    onChange(bank.name, bank.routingNumbers[0]); // Use first routing number as default
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredBanks.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredBanks[highlightedIndex]) {
          handleBankSelect(filteredBanks[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (searchQuery.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </div>

      {isOpen && filteredBanks.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredBanks.map((bank, index) => (
            <div
              key={bank.name}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleBankSelect(bank)}
            >
              <div className="font-medium text-gray-900">{bank.name}</div>
              {bank.aliases && bank.aliases.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Also known as: {bank.aliases.join(', ')}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Primary routing: {bank.routingNumbers[0]}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && searchQuery.length >= 2 && filteredBanks.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-sm">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>No banks found matching "{searchQuery}"</span>
            </div>
            <div className="mt-2 text-xs">
              Try searching for common names like "Chase", "Bank of America", or "Wells Fargo"
            </div>
          </div>
        </div>
      )}
    </div>
  );
}