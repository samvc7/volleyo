import { Member } from "@prisma/client"
import { isWithinInterval } from "date-fns"

export const parseMemberName = (member: Pick<Member, "firstName" | "lastName" | "nickName">) => {
  return member.nickName ? member.nickName : `${member.firstName} ${member.lastName}`
}

export const DATE_FORMAT = "dd.MM.yy"
export const TIME_FORMAT = "HH:mm"
export const DATE_ISO_FORMAT = "yyyy-MM-dd"

export function getCurrentSemesterRange(): [Date, Date] {
  const today = new Date()
  const year = today.getFullYear()

  const summerStart = new Date(year, 1, 15)
  const summerEnd = new Date(year, 5, 30)

  // Winter last year:
  const winterStartLastYear = new Date(year - 1, 8, 15)
  const winterEndThisYear = new Date(year, 1, 15)

  // Winter next year
  const winterStartThisYear = new Date(year, 8, 15)
  const winterEndNextYear = new Date(year + 1, 1, 15)

  const isWinterSemesterLastYear = isWithinInterval(today, {
    start: winterStartLastYear,
    end: winterEndThisYear,
  })
  if (isWinterSemesterLastYear) {
    return [winterStartLastYear, winterEndThisYear]
  }

  const isWinterSemesterNextYear = isWithinInterval(today, {
    start: winterStartThisYear,
    end: winterEndNextYear,
  })
  if (isWinterSemesterNextYear) {
    return [winterStartThisYear, winterEndNextYear]
  }

  // Summer
  if (isWithinInterval(today, { start: summerStart, end: summerEnd })) {
    return [summerStart, summerEnd]
  }

  // Case Summer pause
  return [summerStart, summerEnd]
}
