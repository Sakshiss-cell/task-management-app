"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addCustomField, removeCustomField } from "../store/tasksSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, X } from "lucide-react"

export default function CustomFieldsEditor({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { customFields } = useSelector((state) => state.tasks)
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    filterable: true,
    sortable: true,
    options: [],
  })
  const [optionInput, setOptionInput] = useState("")
  const [error, setError] = useState("")

  const handleAddField = (e) => {
    e.preventDefault()

    if (!newField.name.trim() || !newField.label.trim()) {
      setError("Field name and label are required")
      return
    }

    // Check for duplicate names
    if (customFields.some((field) => field.name.toLowerCase() === newField.name.toLowerCase())) {
      setError("Field name already exists")
      return
    }

    // Validate field name (no special characters except underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newField.name)) {
      setError(
        "Field name can only contain letters, numbers, and underscores, and must start with a letter or underscore",
      )
      return
    }

    // For single_select, ensure we have options
    if (newField.type === "single_select" && newField.options.length === 0) {
      setError("Single select fields must have at least one option")
      return
    }

    dispatch(
      addCustomField({
        ...newField,
        name: newField.name.toLowerCase(),
      }),
    )

    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      filterable: true,
      sortable: true,
      options: [],
    })
    setError("")
  }

  const handleAddOption = () => {
    if (optionInput.trim() && !newField.options.includes(optionInput.trim())) {
      setNewField((prev) => ({
        ...prev,
        options: [...prev.options, optionInput.trim()],
      }))
      setOptionInput("")
    }
  }

  const handleRemoveOption = (optionToRemove) => {
    setNewField((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option !== optionToRemove),
    }))
  }

  const handleRemoveField = (fieldName) => {
    dispatch(removeCustomField(fieldName))
  }

  const canRemoveField = (fieldName) => {
    return !["title", "priority", "status"].includes(fieldName)
  }

  const getFieldTypeLabel = (type) => {
    switch (type) {
      case "text":
        return "Text"
      case "number":
        return "Number"
      case "checkbox":
        return "Checkbox"
      case "single_select":
        return "Single Select"
      default:
        return type
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Custom Fields</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Fields */}
          <div>
            <h3 className="text-sm font-medium mb-3">Current Fields ({customFields.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customFields.map((field) => (
                <div key={field.name} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div>
                      <span className="font-medium">{field.label}</span>
                      <div className="text-xs text-gray-500 space-x-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">{getFieldTypeLabel(field.type)}</span>
                        {field.required && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                        {field.filterable && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Filterable</span>
                        )}
                        {field.sortable && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Sortable</span>
                        )}
                      </div>
                      {field.options && field.options.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">Options: {field.options.join(", ")}</div>
                      )}
                    </div>
                  </div>
                  {canRemoveField(field.name) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Field */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium mb-3">Add New Field</h3>
            <form onSubmit={handleAddField} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fieldName">Field Name (Internal)</Label>
                  <Input
                    id="fieldName"
                    value={newField.name}
                    onChange={(e) => {
                      setNewField((prev) => ({ ...prev, name: e.target.value }))
                      setError("")
                    }}
                    placeholder="e.g., estimated_hours"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldLabel">Field Label (Display)</Label>
                  <Input
                    id="fieldLabel"
                    value={newField.label}
                    onChange={(e) => {
                      setNewField((prev) => ({ ...prev, label: e.target.value }))
                      setError("")
                    }}
                    placeholder="e.g., Estimated Hours"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fieldType">Field Type</Label>
                <Select
                  value={newField.type}
                  onValueChange={(value) =>
                    setNewField((prev) => ({
                      ...prev,
                      type: value,
                      options: value === "single_select" ? prev.options : [],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="single_select">Single Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options for single_select */}
              {newField.type === "single_select" && (
                <div>
                  <Label>Options</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Add option"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())}
                    />
                    <Button type="button" onClick={handleAddOption} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newField.options.map((option) => (
                      <span key={option} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center space-x-1">
                        <span>{option}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(option)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={newField.required}
                    onCheckedChange={(checked) => setNewField((prev) => ({ ...prev, required: checked }))}
                  />
                  <Label htmlFor="required">Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filterable"
                    checked={newField.filterable}
                    onCheckedChange={(checked) => setNewField((prev) => ({ ...prev, filterable: checked }))}
                  />
                  <Label htmlFor="filterable">Filterable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sortable"
                    checked={newField.sortable}
                    onCheckedChange={(checked) => setNewField((prev) => ({ ...prev, sortable: checked }))}
                  />
                  <Label htmlFor="sortable">Sortable</Label>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full">
                Add Field
              </Button>
            </form>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
