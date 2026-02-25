import Header from "../components/Header";
import {Outlet} from "react-router-dom";
const Applayout = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Header />
      <Outlet/>
    </div>
  )
}

export default Applayout;