"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { loadFromStorage, resetToDefaults } from "../store/tasksSlice"

export default function useLocalStorage() {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.tasks)

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("taskManagementApp")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)

        // Validate the loaded state
        if (parsedState.customFields && Array.isArray(parsedState.customFields)) {
          // Check if the state looks corrupted (has unwanted fields)
          const hasInvalidFields = parsedState.customFields.some(
            (field) => !field.name || !field.label || field.name.includes("count") || typeof field !== "object",
          )

          if (hasInvalidFields) {
            console.warn("Corrupted state detected, resetting to defaults")
            dispatch(resetToDefaults())
            localStorage.removeItem("taskManagementApp") // Clear corrupted data
          } else {
            dispatch(loadFromStorage(parsedState))
          }
        } else {
          // Invalid structure, reset to defaults
          dispatch(resetToDefaults())
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error)
        dispatch(resetToDefaults())
        localStorage.removeItem("taskManagementApp")
      }
    }
  }, [dispatch])

  // Save to localStorage whenever state changes
  useEffect(() => {
    // Only save if we have valid data
    if (state.tasks.length > 0 && state.customFields.length > 0) {
      // Clean the state before saving
      const cleanState = {
        ...state,
        customFields: state.customFields.filter((field) => field.name && field.label && !field.name.includes("count")),
      }
      localStorage.setItem("taskManagementApp", JSON.stringify(cleanState))
    }
  }, [state])
}
