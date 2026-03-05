import Sidebar from "./Sidebar";

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-950 text-white">
    <Sidebar />
    <main className="flex-1 p-8 overflow-y-auto">{children}</main>
  </div>
);

export default Layout;