"use client"

import { useSelector, useDispatch } from "react-redux"
import { useState } from "react"
import { setSort, setCurrentPage, setPageSize, deleteTask, bulkDeleteTasks } from "../store/tasksSlice"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronUp, ChevronDown, Edit, Trash2, Settings } from "lucide-react"
import TaskModal from "./TaskModal"
import DeleteConfirmModal from "./DeleteConfirmModal"
import BulkDeleteModal from "./BulkDeleteModal"
import BulkEditModal from "./BulkEditModal"
import FilterManager from "./FilterManager"
import InlineEditCell from "./InlineEditCell"

export default function TaskTable() {
  const dispatch = useDispatch()
  const { tasks, customFields, activeFilters, sortBy, sortOrder, currentPage, pageSize } = useSelector(
    (state) => state.tasks,
  )
  const [editingTask, setEditingTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [editingCell, setEditingCell] = useState(null) // { taskId, fieldName }

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    return activeFilters.every((filter) => {
      const taskValue = task[filter.field]
      const filterValue = filter.value

      switch (filter.operator) {
        case "contains":
          return taskValue?.toString().toLowerCase().includes(filterValue.toLowerCase())
        case "equals":
          if (filter.field === "isUrgent" || customFields.find((f) => f.name === filter.field)?.type === "checkbox") {
            return taskValue?.toString() === filterValue
          }
          return taskValue?.toString().toLowerCase() === filterValue.toLowerCase()
        case "not_equals":
          return taskValue?.toString().toLowerCase() !== filterValue.toLowerCase()
        case "starts_with":
          return taskValue?.toString().toLowerCase().startsWith(filterValue.toLowerCase())
        case "ends_with":
          return taskValue?.toString().toLowerCase().endsWith(filterValue.toLowerCase())
        case "greater_than":
          return Number(taskValue) > Number(filterValue)
        case "less_than":
          return Number(taskValue) < Number(filterValue)
        case "greater_equal":
          return Number(taskValue) >= Number(filterValue)
        case "less_equal":
          return Number(taskValue) <= Number(filterValue)
        default:
          return true
      }
    })
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aValue = a[sortBy] || ""
    const bValue = b[sortBy] || ""

    // Handle different data types
    const fieldType = customFields.find((f) => f.name === sortBy)?.type

    if (fieldType === "number") {
      const aNum = Number(aValue) || 0
      const bNum = Number(bValue) || 0
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum
    }

    if (fieldType === "checkbox") {
      const aBool = Boolean(aValue)
      const bBool = Boolean(bValue)
      if (aBool === bBool) return 0
      return sortOrder === "asc" ? (aBool ? 1 : -1) : aBool ? -1 : 1
    }

    // Default string comparison
    if (sortOrder === "asc") {
      return aValue.toString().localeCompare(bValue.toString())
    } else {
      return bValue.toString().localeCompare(aValue.toString())
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedTasks.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + pageSize)

  const handleSort = (field) => {
    const fieldObj = customFields.find((f) => f.name === field)
    if (fieldObj?.sortable) {
      dispatch(setSort(field))
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDelete = (taskId) => {
    setDeleteTaskId(taskId)
  }

  const confirmDelete = () => {
    dispatch(deleteTask(deleteTaskId))
    setDeleteTaskId(null)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allTaskIds = new Set(paginatedTasks.map((task) => task.id))
      setSelectedTasks(allTaskIds)
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleSelectTask = (taskId, checked) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true)
  }

  const handleBulkEdit = () => {
    setShowBulkEditModal(true)
  }

  const confirmBulkDelete = () => {
    dispatch(bulkDeleteTasks(Array.from(selectedTasks)))
    setSelectedTasks(new Set())
    setShowBulkDeleteModal(false)
  }

  const handleStartEdit = (taskId, fieldName) => {
    setEditingCell({ taskId, fieldName })
  }

  const handleEndEdit = () => {
    setEditingCell(null)
  }

  const isAllSelected = paginatedTasks.length > 0 && paginatedTasks.every((task) => selectedTasks.has(task.id))
  const isIndeterminate = selectedTasks.size > 0 && !isAllSelected

  const getSortIcon = (field) => {
    if (sortBy !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const renderCellValue = (task, field) => {
    const value = task[field.name]

    switch (field.type) {
      case "checkbox":
        return <input type="checkbox" checked={value || false} readOnly className="rounded" />
      case "number":
        return <span>{value || 0}</span>
      case "single_select":
        // Add colors only for priority field
        if (field.name === "priority") {
          return <span className={getPriorityColor(value)}>{value || "-"}</span>
        }
        return <span>{value || "-"}</span>
      default:
        return <span>{value || "-"}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Manager */}
      <FilterManager />

      {/* Bulk Actions Bar */}
      {selectedTasks.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedTasks.size} task{selectedTasks.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTasks(new Set())}>
                Clear Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
                className="flex items-center space-x-1 bg-transparent"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Selected</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Edit Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>
            <strong>Inline Editing:</strong> Click on any cell to edit in place. Press Enter to save, Escape to cancel.
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                    aria-label="Select all tasks"
                  />
                </th>
                {customFields.map((field) => (
                  <th key={field.name} className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort(field.name)}
                      className={`flex items-center space-x-1 font-medium text-gray-900 ${
                        field.sortable ? "hover:text-gray-700 cursor-pointer" : "cursor-default"
                      }`}
                      disabled={!field.sortable}
                    >
                      <span>{field.label || field.name}</span>
                      {field.sortable && getSortIcon(field.name)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={customFields.length + 2} className="px-4 py-8 text-center text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-gray-50 ${selectedTasks.has(task.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                        className="rounded"
                        aria-label={`Select task: ${task.title}`}
                      />
                    </td>
                    {customFields.map((field) => (
                      <td key={field.name} className="px-2 py-1">
                        <InlineEditCell
                          task={task}
                          field={field}
                          value={task[field.name]}
                          isEditing={editingCell?.taskId === task.id && editingCell?.fieldName === field.name}
                          onStartEdit={() => handleStartEdit(task.id, field.name)}
                          onEndEdit={handleEndEdit}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(task)}
                          aria-label="Edit task in modal"
                          title="Edit in modal"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <Select value={pageSize.toString()} onValueChange={(value) => dispatch(setPageSize(Number.parseInt(value)))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700">of {sortedTasks.length} tasks</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
      />

      <DeleteConfirmModal isOpen={!!deleteTaskId} onClose={() => setDeleteTaskId(null)} onConfirm={confirmDelete} />

      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        selectedCount={selectedTasks.size}
      />

      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => {
          setShowBulkEditModal(false)
          setSelectedTasks(new Set())
        }}
        selectedTaskIds={Array.from(selectedTasks)}
      />
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
