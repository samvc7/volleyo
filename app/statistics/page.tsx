import { DataTable } from "@/app/statistics/data-table"
// import { StatisticsTable } from "./table";
import { columns, Statistics } from "@/app/statistics/columns"

export default async function StatisticsPage() {
  const data = await getData()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="container mx-auto py-10">
          <DataTable
            columns={columns}
            data={data}
          />
        </div>
        {/* <StatisticsTable /> */}
      </div>
    </main>
  )
}

async function getData(): Promise<Statistics[]> {
  return [
    {
      id: "m5gr84i9",
      name: "Monserrat",
      attackSuccess: 10,
      attackFailures: 0,
      digs: 10,
      sets: 0,
      blocks: 7,
      errors: 5,
    },
    {
      id: "3u1reuv4",
      name: "Silas",
      attackSuccess: 1,
      attackFailures: 2,
      digs: 20,
      sets: 0,
      blocks: 12,
      errors: 7,
    },
    {
      id: "derv1ws0",
      name: "Carmella",
      attackSuccess: 4,
      attackFailures: 7,
      digs: 13,
      sets: 0,
      blocks: 2,
      errors: 2,
    },
    {
      id: "5kma53ae",
      name: "Kathlyn",
      attackSuccess: 20,
      attackFailures: 3,
      digs: 1,
      sets: 0,
      blocks: 1,
      errors: 9,
    },
    {
      id: "bhqecj4p",
      name: "Laurie",
      attackSuccess: 7,
      attackFailures: 4,
      digs: 12,
      sets: 0,
      blocks: 1,
      errors: 1,
    },
  ]
}
