export interface PublicHoliday {
  date: string
  localName: string
  name: string
  countryCode: string
  fixed: boolean
  global: boolean
  counties: string[] | null
  launchYear: number | null
  types: string[]
}

/**
 * Fetch public holidays for Indonesia (ID) for a given year.
 * Uses Next.js fetch with revalidation to cache results.
 */
export async function getIndonesianHolidays(year: number): Promise<PublicHoliday[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`, {
      next: { revalidate: 604800 }, // cache for 1 week
    })
    
    if (!res.ok) {
      console.warn(`Failed to fetch holidays for ${year}, status: ${res.status}`)
      return []
    }

    return await res.json()
  } catch (error) {
    console.error(`Error fetching holidays for ${year}:`, error)
    return []
  }
}

/**
 * Convenience function to get an array of holiday date strings (YYYY-MM-DD)
 */
export async function getHolidayDates(year: number): Promise<string[]> {
  const holidays = await getIndonesianHolidays(year)
  return holidays.map(h => h.date)
}
