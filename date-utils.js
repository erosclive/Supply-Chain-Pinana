/**
 * Date utilities for batch management
 * This script fixes the expiration date display issue in the batch management modal
 */

// Improve the parseDate function to handle more edge cases
function parseDate(dateString) {
    if (!dateString) return null
  
    // Handle '0000-00-00' as a special case
    if (dateString === "0000-00-00") return null
  
    // Try different date formats
    const formats = [
      // MySQL format: YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // US format: MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // Other common format: DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // ISO format with time: YYYY-MM-DDTHH:MM:SS
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
    ]
  
    for (const format of formats) {
      const parts = dateString.match(format)
      if (parts) {
        if (format === formats[0]) {
          // YYYY-MM-DD
          return new Date(Number.parseInt(parts[1]), Number.parseInt(parts[2]) - 1, Number.parseInt(parts[3]))
        } else if (format === formats[1]) {
          // MM/DD/YYYY
          return new Date(Number.parseInt(parts[3]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[2]))
        } else if (format === formats[2]) {
          // DD/MM/YYYY
          return new Date(Number.parseInt(parts[3]), Number.parseInt(parts[2]) - 1, Number.parseInt(parts[1]))
        } else if (format === formats[3]) {
          // ISO format
          return new Date(dateString)
        }
      }
    }
  
    // If all else fails, try the JavaScript Date parser
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? null : date
    } catch (error) {
      console.error("Error parsing date:", error, dateString)
      return null
    }
  }
  
  // Improve the formatDateForDisplay function to handle more edge cases
  function formatDateForDisplay(date) {
    if (!date) return "N/A"
  
    // If it's a string, try to parse it
    if (typeof date === "string") {
      date = parseDate(date)
      if (!date) return "Invalid date"
    }
  
    try {
      // Format as MM/DD/YYYY
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${month}/${day}/${year}`
    } catch (error) {
      console.error("Error formatting date for display:", error)
      return "Invalid date"
    }
  }
  
  // Format a date for input fields (YYYY-MM-DD)
  function formatDateForInput(dateString) {
    const date = parseDate(dateString)
    if (!date) return ""
  
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
  
    return `${year}-${month}-${day}`
  }
  
  // Format a date for server (YYYY-MM-DD)
  function formatDateForServer(dateString) {
    const date = parseDate(dateString)
    if (!date) return ""
  
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
  
    return `${year}-${month}-${day}`
  }
  
  // Fix the generateExpirationDate function to correctly add 2 months
  function generateExpirationDate(fromDate = null) {
    const date = fromDate ? parseDate(fromDate) : new Date()
    if (!date) return ""
  
    // Add exactly 2 months to the date
    date.setMonth(date.getMonth() + 2)
  
    // Format as YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
  
    return `${year}-${month}-${day}`
  }
  
  