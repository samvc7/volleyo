export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold">403 - Forbidden</h1>
        <p className="mt-4 text-lg">{`You don't have permission to access this page.`}</p>
      </div>
    </div>
  )
}
