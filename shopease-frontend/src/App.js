import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Navigate from "./components/Navigate";
import Footer from "./components/Footer";
import Service from "./components/Service";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import FullProductPage from "./pages/FullProductPage";
import CategoryProductPage from "./pages/CategoryProductPage";
import UserProfile from "./pages/UserProfile";
import ErrorBoundary from "./components/ErrorBoundary ";
import WishList from "./pages/WishList";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SearchPage from "./pages/SearchPage";
import PayPage from "./pages/PayPage";
import OrderSummary from "./pages/OrderSummary";

const AppContent = () => {
  const location = useLocation();
  const noHeaderPaths = ["/signin", "/signup"];

  return (
    <>
      {!noHeaderPaths.includes(location.pathname) && (
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
      )}
      {!noHeaderPaths.includes(location.pathname) && <Navigate />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/product" element={<FullProductPage />} />
          <Route
            path="/category/:categoryId"
            element={<CategoryProductPage />}
          />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pay" element={<PayPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
      <Service />
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
