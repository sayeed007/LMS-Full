"use client"

import * as React from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export interface SearchableSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
  emptyMessage?: string
  size?: "sm" | "default"
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  clearable = true,
  searchable = true,
  emptyMessage = "No options found",
  size = "default",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const searchLower = search.toLowerCase()
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchLower)
    )
  }, [options, search])

  // Get selected option
  const selectedOption = options.find((option) => option.value === value)

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false) // Ensure dropdown stays closed
    onValueChange?.(undefined)
  }

  // Handle value change
  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue)
    setOpen(false)
    setSearch("")
  }

  return (
    <div className="relative">
      <Select
        open={open}
        onOpenChange={setOpen}
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn("relative h-10", className)} size={size}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {clearable && value && !disabled && (
          <button
            onMouseDown={handleClear}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 hover:bg-gray-200 rounded-sm p-0.5 opacity-70 hover:opacity-100 transition-all z-20"
            type="button"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
        <SelectContent className="max-h-[300px] bg-white">
          {searchable && (
            <div className="sticky top-0 z-10 bg-white border-b px-3 py-2 mb-1">
              <div className="flex items-center border border-gray-300 rounded-md px-2 bg-gray-50">
                <Search className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />
                <input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex h-8 w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSearch("")
                    }}
                    className="hover:bg-gray-200 rounded-sm p-0.5 opacity-70 hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    <X className="h-3 w-3 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="max-h-[250px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

// Simpler enhanced select with just clearable feature
export interface EnhancedSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
  size?: "sm" | "default"
}

export function EnhancedSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  className,
  disabled = false,
  clearable = true,
  size = "default",
}: EnhancedSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
    onValueChange?.(undefined)
  }

  return (
    <div className="relative">
      <Select value={value} onValueChange={onValueChange} disabled={disabled} open={open} onOpenChange={setOpen}>
        <SelectTrigger className={cn("relative", className)} size={size}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {clearable && value && !disabled && (
          <button
            onMouseDown={handleClear}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 hover:bg-gray-200 rounded-sm p-0.5 opacity-70 hover:opacity-100 transition-all z-20"
            type="button"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
