"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addFilter, removeFilter, clearAllFilters } from "../store/tasksSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Filter } from "lucide-react"

export default function FilterManager() {
  const dispatch = useDispatch()
  const { customFields, activeFilters } = useSelector((state) => state.tasks)
  const [selectedField, setSelectedField] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [operator, setOperator] = useState("equals")

  const filterableFields = customFields.filter((field) => field.filterable)

  // Debug log
  console.log("Custom fields:", customFields)
  console.log("Filterable fields:", filterableFields)

  const getOperatorsForField = (fieldType) => {
    switch (fieldType) {
      case "text":
        return [
          { value: "contains", label: "Contains" },
          { value: "equals", label: "Equals" },
          { value: "starts_with", label: "Starts with" },
          { value: "ends_with", label: "Ends with" },
        ]
      case "number":
        return [
          { value: "equals", label: "Equals" },
          { value: "greater_than", label: "Greater than" },
          { value: "less_than", label: "Less than" },
          { value: "greater_equal", label: "Greater or equal" },
          { value: "less_equal", label: "Less or equal" },
        ]
      case "single_select":
        return [
          { value: "equals", label: "Is" },
          { value: "not_equals", label: "Is not" },
        ]
      case "checkbox":
        return [{ value: "equals", label: "Is" }]
      default:
        return [{ value: "equals", label: "Equals" }]
    }
  }

  const renderFilterInput = () => {
    if (!selectedField) return null

    const field = customFields.find((f) => f.name === selectedField)
    if (!field) return null

    switch (field.type) {
      case "single_select":
        return (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )
      case "number":
        return (
          <Input
            type="number"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-48"
          />
        )
      default:
        return (
          <Input
            type="text"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-48"
          />
        )
    }
  }

  const handleAddFilter = () => {
    if (!selectedField || !filterValue) return

    dispatch(
      addFilter({
        field: selectedField,
        operator,
        value: filterValue,
      }),
    )

    // Reset form
    setSelectedField("")
    setFilterValue("")
    setOperator("equals")
  }

  const handleRemoveFilter = (field) => {
    dispatch(removeFilter(field))
  }

  const getFieldLabel = (fieldName) => {
    const field = customFields.find((f) => f.name === fieldName)
    return field?.label || fieldName
  }

  const getOperatorLabel = (operatorValue) => {
    const allOperators = [
      { value: "contains", label: "Contains" },
      { value: "equals", label: "Equals" },
      { value: "starts_with", label: "Starts with" },
      { value: "ends_with", label: "Ends with" },
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "greater_equal", label: "Greater or equal" },
      { value: "less_equal", label: "Less or equal" },
      { value: "not_equals", label: "Is not" },
    ]
    return allOperators.find((op) => op.value === operatorValue)?.label || operatorValue
  }

  const selectedFieldObj = customFields.find((f) => f.name === selectedField)
  const availableOperators = selectedFieldObj ? getOperatorsForField(selectedFieldObj.type) : []

  return (
    <div className="space-y-4">
      {/* Add Filter Section */}
      <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Add Filter:</span>

        {/* Field Selection */}
        <Select
          value={selectedField}
          onValueChange={(value) => {
            setSelectedField(value)
            setFilterValue("")
            setOperator("equals")
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {filterableFields.map((field) => (
              <SelectItem key={field.name} value={field.name}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Operator Selection */}
        {selectedField && (
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Value Input */}
        {selectedField && renderFilterInput()}

        {/* Add Button */}
        <Button
          onClick={handleAddFilter}
          disabled={!selectedField || !filterValue}
          size="sm"
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            <Button variant="outline" size="sm" onClick={() => dispatch(clearAllFilters())} className="text-xs">
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1 px-3 py-1">
                <span className="text-xs">
                  {getFieldLabel(filter.field)} {getOperatorLabel(filter.operator)} "{filter.value}"
                </span>
                <button
                  onClick={() => handleRemoveFilter(filter.field)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  aria-label={`Remove filter for ${getFieldLabel(filter.field)}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
