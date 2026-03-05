import { lazy, Suspense, useState, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { APP_ROUTE_PATHS } from './navigation/paths'
import { isStandalone } from './utils/detectStandalone'
import InstallGuide from './pages/InstallGuide'

const Home = lazy(() => import('./pages/Home'))
const Discover = lazy(() => import('./pages/Discover'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Sell = lazy(() => import('./pages/Sell'))
const Messages = lazy(() => import('./pages/Messages'))
const SellerProfile = lazy(() => import('./pages/SellerProfile'))
const ChatDetail = lazy(() => import('./pages/ChatDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const FeedTagFilters = lazy(() => import('./pages/FeedTagFilters'))
const Drafts = lazy(() => import('./pages/Drafts'))

export default function App() {
  const [standalone, setStandalone] = useState(() => isStandalone())

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setStandalone(true)
    }
    mq.addEventListener('change', handler)

    return () => {
      mq.removeEventListener('change', handler)
    }
  }, [])

  if (!standalone) return <InstallGuide />

  return (
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={APP_ROUTE_PATHS.home} element={<Home />} />
            <Route path={APP_ROUTE_PATHS.discover} element={<Discover />} />
            <Route path={APP_ROUTE_PATHS.product} element={<ProductDetail />} />
            <Route path={APP_ROUTE_PATHS.profile} element={<Profile />} />
            <Route path={APP_ROUTE_PATHS.sell} element={<Sell />} />
            <Route path={APP_ROUTE_PATHS.messages} element={<Messages />} />
            <Route path={APP_ROUTE_PATHS.seller} element={<SellerProfile />} />
            <Route path={APP_ROUTE_PATHS.chat} element={<ChatDetail />} />
            <Route path={APP_ROUTE_PATHS.cart} element={<Cart />} />
            <Route path={APP_ROUTE_PATHS.feedTags} element={<FeedTagFilters />} />
            <Route path={APP_ROUTE_PATHS.drafts} element={<Drafts />} />
            <Route path="*" element={<Navigate to={APP_ROUTE_PATHS.home} replace />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
