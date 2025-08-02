"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateTask } from "../store/tasksSlice"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit2 } from "lucide-react"

export default function InlineEditCell({ task, field, value, onStartEdit, onEndEdit, isEditing }) {
  const dispatch = useDispatch()
  const { customFields } = useSelector((state) => state.tasks)
  const [editValue, setEditValue] = useState(value)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (field.type === "text") {
        inputRef.current.select()
      }
    }
  }, [isEditing, field.type])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    if (editValue !== value) {
      dispatch(
        updateTask({
          ...task,
          [field.name]: editValue,
        }),
      )
    }
    onEndEdit()
  }

  const handleCancel = () => {
    setEditValue(value)
    onEndEdit()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleClick = () => {
    if (!isEditing) {
      onStartEdit()
    }
  }

  const renderDisplayValue = () => {
    switch (field.type) {
      case "checkbox":
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={value || false}
              readOnly
              className="rounded cursor-pointer"
              onClick={handleClick}
            />
          </div>
        )
      case "number":
        return <span className="cursor-pointer">{value || 0}</span>
      case "single_select":
        // Add colors only for priority field
        if (field.name === "priority") {
          return <span className={`cursor-pointer ${getPriorityColor(value)}`}>{value || "-"}</span>
        }
        return <span className="cursor-pointer">{value || "-"}</span>
      default:
        return <span className="cursor-pointer">{value || "-"}</span>
    }
  }

  const renderEditControl = () => {
    switch (field.type) {
      case "single_select":
        return (
          <div className="flex items-center space-x-1">
            <Select
              value={editValue || ""}
              onValueChange={setEditValue}
              onOpenChange={(open) => {
                if (!open) {
                  // Small delay to allow selection to complete
                  setTimeout(handleSave, 100)
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case "checkbox":
        return (
          <div className="flex items-center justify-center space-x-1">
            <Checkbox
              checked={editValue || false}
              onCheckedChange={(checked) => {
                setEditValue(checked)
                // Auto-save for checkboxes
                setTimeout(() => {
                  dispatch(
                    updateTask({
                      ...task,
                      [field.name]: checked,
                    }),
                  )
                  onEndEdit()
                }, 100)
              }}
            />
          </div>
        )
      case "number":
        return (
          <div className="flex items-center space-x-1">
            <Input
              ref={inputRef}
              type="number"
              value={editValue || ""}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 text-xs"
            />
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1">
            <Input
              ref={inputRef}
              type="text"
              value={editValue || ""}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 text-xs"
            />
          </div>
        )
    }
  }

  if (field.type === "checkbox") {
    return (
      <div className="px-2 py-1 min-h-[32px] flex items-center justify-center" onClick={handleClick}>
        {isEditing ? renderEditControl() : renderDisplayValue()}
      </div>
    )
  }

  return (
    <div
      className={`px-2 py-1 min-h-[32px] flex items-center justify-between relative group ${
        isEditing ? "bg-blue-50 border border-blue-300 rounded" : "hover:bg-gray-50 rounded"
      } ${!isEditing ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="w-full">{renderEditControl()}</div>
      ) : (
        <>
          <div className="flex-1 min-w-0">{renderDisplayValue()}</div>
          {/* Always reserve space for icon to prevent layout shift */}
          <div className="flex-shrink-0 w-5 flex justify-center">
            <Edit2
              className={`w-3 h-3 transition-opacity duration-150 ${
                isHovered ? "opacity-100 text-gray-400 hover:text-gray-600" : "opacity-0"
              }`}
            />
          </div>
        </>
      )}
    </div>
  )
}

// Simple priority color function
function getPriorityColor(priority) {
  switch (priority) {
    case "high":
    case "urgent":
      return "text-red-600 font-medium"
    case "medium":
      return "text-yellow-600 font-medium"
    case "low":
      return "text-green-600 font-medium"
    case "none":
      return "text-gray-500"
    default:
      return ""
  }
}
