import { Person } from "@prisma/client"

export const parsePersonName = (person: Pick<Person, "firstName" | "lastName" | "nickName">) => {
  return person.nickName ? person.nickName : `${person.firstName} ${person.lastName}`
}

export const DATE_FORMAT = "dd.MM.yy"
