import Layout from './components/layout/Layout'
import SearchForm from './components/search/SearchForm'
import SearchProgress from './components/search/SearchProgress'
import DossierView from './components/dossier/DossierView'
import useProfileStore from './store/useProfileStore'

export default function App() {
  const searchStatus = useProfileStore(s => s.searchStatus)
  const activeProfileId = useProfileStore(s => s.activeProfileId)

  function renderMain() {
    if (searchStatus === 'searching') return <SearchProgress />
    if (searchStatus === 'error') return <SearchProgress />
    if (activeProfileId) return <DossierView />
    return <SearchForm />
  }

  return (
    <Layout>
      {renderMain()}
    </Layout>
  )
}
