import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Discover from './pages/Discover'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Sell from './pages/Sell'
import Messages from './pages/Messages'
import SellerProfile from './pages/SellerProfile'
import ChatDetail from './pages/ChatDetail'
import FeedTagFilters from './pages/FeedTagFilters'
import ScrollToTop from './components/ScrollToTop'
import { APP_ROUTE_PATHS } from './navigation/paths'

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
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
          <Route path={APP_ROUTE_PATHS.feedTags} element={<FeedTagFilters />} />
          <Route path="*" element={<Navigate to={APP_ROUTE_PATHS.home} replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
