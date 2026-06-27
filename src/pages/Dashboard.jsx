import Layout from '../components/Layout'

function Dashboard() {
  return (
    <Layout title="My Contracts">
      <div className="max-w-4xl">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-base font-medium text-slate-900 mb-1">
            No contracts yet
          </h2>
          <p className="text-sm text-slate-500">
            Your saved contracts will appear here. Creating and analyzing
            contracts comes in the next build step.
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard