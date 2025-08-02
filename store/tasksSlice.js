import { createSlice } from "@reduxjs/toolkit"
import { task } from "../lib/task"

// Mock data
const initialTasks = task

const initialCustomFields = [
  {
    name: "title",
    label: "Task Title",
    type: "text",
    required: true,
    filterable: true,
    sortable: true,
  },
  {
    name: "priority",
    label: "Priority",
    type: "single_select",
    required: true,
    options: ["high", "medium", "low", "none"],
    filterable: true,
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    type: "single_select",
    required: true,
    options: ["not_started", "in_progress", "completed", "none"],
    filterable: true,
    sortable: true,
  },
]

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: initialTasks,
    customFields: initialCustomFields,
    activeFilters: [],
    sortBy: "title",
    sortOrder: "asc",
    currentPage: 1,
    pageSize: 10,
  },
  reducers: {
    addTask: (state, action) => {
      const newTask = {
        ...action.payload,
        id: Date.now(),
      }
      state.tasks.push(newTask)
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex((task) => task.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload }
      }
    },
    bulkUpdateTasks: (state, action) => {
      const { taskIds, updateData } = action.payload
      state.tasks.forEach((task) => {
        if (taskIds.includes(task.id)) {
          Object.keys(updateData).forEach((key) => {
            task[key] = updateData[key]
          })
        }
      })
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload)
    },
    bulkDeleteTasks: (state, action) => {
      const taskIdsToDelete = action.payload
      state.tasks = state.tasks.filter((task) => !taskIdsToDelete.includes(task.id))
    },
    addFilter: (state, action) => {
      const { field, operator, value } = action.payload
      // Remove existing filter for the same field
      state.activeFilters = state.activeFilters.filter((f) => f.field !== field)
      // Add new filter if value is not empty
      if (value !== "" && value !== null && value !== undefined) {
        state.activeFilters.push({ field, operator, value })
      }
      state.currentPage = 1
    },
    removeFilter: (state, action) => {
      const fieldToRemove = action.payload
      state.activeFilters = state.activeFilters.filter((f) => f.field !== fieldToRemove)
      state.currentPage = 1
    },
    clearAllFilters: (state) => {
      state.activeFilters = []
      state.currentPage = 1
    },
    setSort: (state, action) => {
      if (state.sortBy === action.payload) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc"
      } else {
        state.sortBy = action.payload
        state.sortOrder = "asc"
      }
      state.currentPage = 1
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload
      state.currentPage = 1
    },
    addCustomField: (state, action) => {
      // Validate field before adding
      const newField = action.payload

      // Check if field already exists
      if (state.customFields.some((field) => field.name === newField.name)) {
        return // Don't add duplicate fields
      }

      state.customFields.push(newField)

      // Add empty values for existing tasks
      state.tasks.forEach((task) => {
        if (task[newField.name] === undefined) {
          if (newField.type === "checkbox") {
            task[newField.name] = false
          } else if (newField.type === "number") {
            task[newField.name] = 0
          } else {
            task[newField.name] = ""
          }
        }
      })
    },
    removeCustomField: (state, action) => {
      const fieldName = action.payload
      // Don't allow removing required fields
      if (["title", "priority", "status"].includes(fieldName)) return

      state.customFields = state.customFields.filter((field) => field.name !== fieldName)
      // Remove field from all tasks
      state.tasks.forEach((task) => {
        delete task[fieldName]
      })
      // Remove from active filters
      state.activeFilters = state.activeFilters.filter((f) => f.field !== fieldName)
    },
    loadFromStorage: (state, action) => {
      const loadedState = action.payload

      // Validate and clean the loaded state
      if (loadedState.customFields) {
        // Filter out any invalid or unwanted fields
        const validFields = loadedState.customFields.filter(
          (field) => field.name && field.label && field.type && !field.name.includes("count"), // Remove any count fields
        )
        loadedState.customFields = validFields
      }

      return { ...state, ...loadedState }
    },
    resetToDefaults: (state) => {
      // Reset to clean initial state
      return {
        tasks: initialTasks,
        customFields: initialCustomFields,
        activeFilters: [],
        sortBy: "title",
        sortOrder: "asc",
        currentPage: 1,
        pageSize: 10,
      }
    },
  },
})

export const {
  addTask,
  updateTask,
  bulkUpdateTasks,
  deleteTask,
  bulkDeleteTasks,
  addFilter,
  removeFilter,
  clearAllFilters,
  setSort,
  setCurrentPage,
  setPageSize,
  addCustomField,
  removeCustomField,
  loadFromStorage,
  resetToDefaults,
} = tasksSlice.actions

export default tasksSlice.reducer
