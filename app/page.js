"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Plus, Settings, RotateCcw } from "lucide-react"
import TaskTable from "../components/TaskTable"
import TaskModal from "../components/TaskModal"
import CustomFieldsEditor from "../components/CustomFieldsEditor"
import useLocalStorage from "../hooks/useLocalStorage"
import { resetToDefaults } from "../store/tasksSlice"

export default function Home() {
  const dispatch = useDispatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFieldsEditorOpen, setIsFieldsEditorOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { tasks, customFields } = useSelector((state) => state.tasks)

  // Initialize localStorage hook
  useLocalStorage()

  // Set loaded state after component mounts
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data to defaults? This cannot be undone.")) {
      dispatch(resetToDefaults())
      localStorage.removeItem("taskManagementApp")
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Data</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFieldsEditorOpen(true)}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Custom Fields ({customFields.length})</span>
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskTable />
          </div>
        </div>

        {/* Modals */}
        <TaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

        <CustomFieldsEditor isOpen={isFieldsEditorOpen} onClose={() => setIsFieldsEditorOpen(false)} />
      </div>
    </div>
  )
}
