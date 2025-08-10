/**
 * Formats time to HH:MM format
 * @param time - Time string in various formats (HH:MM, HH:MM:SS, etc.)
 * @returns Time string in HH:MM format
 */
export function formatTime(time: string): string {
  if (!time) return '00:00';
  
  // If time is already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // If time has seconds (HH:MM:SS), remove them
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time.substring(0, 5);
  }
  
  // If time is in H:MM format, pad with zero
  if (/^\d{1}:\d{2}$/.test(time)) {
    return `0${time}`;
  }
  
  // If time is in H:MM:SS format, pad with zero and remove seconds
  if (/^\d{1}:\d{2}:\d{2}$/.test(time)) {
    return `0${time.substring(0, 4)}`;
  }
  
  // Try to parse as Date and format
  try {
    const date = new Date(`2000-01-01T${time}`);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().substring(0, 5);
    }
  } catch (error) {
    // Ignore parsing errors
  }
  
  // Default fallback - extract first 5 characters if it looks like time
  if (time.includes(':')) {
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  
  // Final fallback
  return time.length >= 5 ? time.substring(0, 5) : time;
}

/**
 * Formats operating hours object to ensure consistent HH:MM format
 * @param operatingHours - Operating hours object with open and close properties
 * @returns Formatted operating hours object
 */
export function formatOperatingHours(operatingHours?: { open?: string; close?: string }) {
  if (!operatingHours) {
    return { open: '06:00', close: '22:00' };
  }
  
  return {
    open: formatTime(operatingHours.open || '06:00'),
    close: formatTime(operatingHours.close || '22:00')
  };
}
