import Header from "../components/Header";
import {Outlet} from "react-router-dom";
const Applayout = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to Main Content
      </a>
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Outlet/>
      </main>
    </div>
  )
}

export default Applayout;