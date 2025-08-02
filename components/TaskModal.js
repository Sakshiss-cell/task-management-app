"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addTask, updateTask } from "../store/tasksSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function TaskModal({ isOpen, onClose, task }) {
  const dispatch = useDispatch()
  const { customFields } = useSelector((state) => state.tasks)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (task) {
      setFormData(task)
    } else {
      // Initialize with default values
      const defaultData = {}
      customFields.forEach((field) => {
        if (field.type === "checkbox") {
          defaultData[field.name] = false
        } else {
          defaultData[field.name] = ""
        }
      })
      setFormData(defaultData)
    }
    setErrors({})
  }, [task, customFields, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    const newErrors = {}
    customFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.name} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (task) {
      dispatch(updateTask(formData))
    } else {
      dispatch(addTask(formData))
    }

    onClose()
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
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
                id={field.name}
                checked={value}
                onCheckedChange={(checked) => handleChange(field.name, checked)}
              />
              <Label htmlFor={field.name} className="capitalize">
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {customFields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== "checkbox" && (
                <Label htmlFor={field.name} className="capitalize">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              )}
              {renderField(field)}
              {errors[field.name] && <p className="text-sm text-red-600">{errors[field.name]}</p>}
            </div>
          ))}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Update" : "Create"} Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
