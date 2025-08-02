"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { bulkUpdateTasks } from "../store/tasksSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function BulkEditModal({ isOpen, onClose, selectedTaskIds }) {
  const dispatch = useDispatch()
  const { customFields, tasks } = useSelector((state) => state.tasks)
  const [formData, setFormData] = useState({})
  const [fieldsToUpdate, setFieldsToUpdate] = useState(new Set())

  const selectedTasks = tasks.filter((task) => selectedTaskIds.includes(task.id))

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({})
      setFieldsToUpdate(new Set())
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Only update fields that are selected for update
    const updateData = {}
    fieldsToUpdate.forEach((fieldName) => {
      updateData[fieldName] = formData[fieldName]
    })

    if (Object.keys(updateData).length === 0) {
      return // No fields selected for update
    }

    dispatch(bulkUpdateTasks({ taskIds: selectedTaskIds, updateData }))
    onClose()
  }

  const handleFieldToggle = (fieldName, checked) => {
    const newFieldsToUpdate = new Set(fieldsToUpdate)
    if (checked) {
      newFieldsToUpdate.add(fieldName)
    } else {
      newFieldsToUpdate.delete(fieldName)
    }
    setFieldsToUpdate(newFieldsToUpdate)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const renderField = (field) => {
    const value = formData[field.name] || (field.type === "checkbox" ? false : "")

    switch (field.name) {
      case "priority":
        return (
          <Select value={value} onValueChange={(val) => handleChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        )
      case "status":
        return (
          <Select value={value} onValueChange={(val) => handleChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        if (field.type === "checkbox") {
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`bulk-${field.name}`}
                checked={value}
                onCheckedChange={(checked) => handleChange(field.name, checked)}
              />
              <Label htmlFor={`bulk-${field.name}`} className="capitalize">
                {field.name}
              </Label>
            </div>
          )
        } else if (field.type === "number") {
          return (
            <Input
              type="number"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.name}`}
            />
          )
        } else {
          return (
            <Input
              type="text"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.name}`}
            />
          )
        }
    }
  }

  const getFieldPreview = (field) => {
    const values = selectedTasks.map((task) => task[field.name]).filter(Boolean)
    const uniqueValues = [...new Set(values)]

    if (uniqueValues.length === 0) return "No values"
    if (uniqueValues.length === 1) return `All: ${formatDisplayValue(uniqueValues[0], field.name)}`
    if (uniqueValues.length <= 3)
      return `Mixed: ${uniqueValues.map((v) => formatDisplayValue(v, field.name)).join(", ")}`
    return `Mixed: ${uniqueValues.length} different values`
  }

  const formatDisplayValue = (value, fieldName) => {
    if (fieldName === "status") {
      switch (value) {
        case "not_started":
          return "Not Started"
        case "in_progress":
          return "In Progress"
        case "completed":
          return "Completed"
        case "on_hold":
          return "On Hold"
        default:
          return value
      }
    }
    if (fieldName === "priority") {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Bulk Edit {selectedTaskIds.length} Task{selectedTaskIds.length > 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-2">Selected Tasks:</p>
            <div className="max-h-20 overflow-y-auto">
              {selectedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="text-xs">
                  • {task.title}
                </div>
              ))}
              {selectedTasks.length > 5 && (
                <div className="text-xs text-gray-500">... and {selectedTasks.length - 5} more</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Select fields to update and set new values:</p>

            {customFields.map((field) => (
              <div key={field.name} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`update-${field.name}`}
                      checked={fieldsToUpdate.has(field.name)}
                      onCheckedChange={(checked) => handleFieldToggle(field.name, checked)}
                    />
                    <Label htmlFor={`update-${field.name}`} className="capitalize font-medium">
                      Update {field.label}
                    </Label>
                  </div>
                  <div className="text-xs text-gray-500">Current: {getFieldPreview(field)}</div>
                </div>

                {fieldsToUpdate.has(field.name) && (
                  <div className="ml-6">
                    <Label className="text-sm text-gray-600 mb-2 block">New value for {field.label}:</Label>
                    {renderField(field)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={fieldsToUpdate.size === 0} className="min-w-[120px]">
              Update {selectedTaskIds.length} Task{selectedTaskIds.length > 1 ? "s" : ""}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
