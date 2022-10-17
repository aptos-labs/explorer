import React from "react";
import {Route, Routes} from "react-router-dom";
import LandingPage from "./pages/LandingPage/Index";
import NotFoundPage from "./pages/layout/NotFoundPage";
import ExplorerLayout from "./pages/layout";
import TransactionPage from "./pages/Transaction/Index";
import AccountPage from "./pages/Account/Index";
import BlockPage from "./pages/Block/Index";
import TokenPage from "./pages/Token/Index";
import TransactionsPage from "./pages/Transactions/Index";
import BlocksPage from "./pages/Blocks/Index";
import ValidatorsPage from "./pages/Validators/Index";

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/validators" element={<ValidatorsPage />} />
        <Route path="/txn">
          <Route path=":txnHashOrVersion" element={<TransactionPage />} />
        </Route>
        <Route path="/account">
          <Route path=":address" element={<AccountPage />} />
        </Route>
        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/block">
          <Route path=":height" element={<BlockPage />} />
        </Route>
        <Route path="/token">
          <Route path=":tokenId" element={<TokenPage />} />
          <Route path=":tokenId/:propertyVersion" element={<TokenPage />} />
        </Route>
        <Route path="/proposals/*" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ExplorerLayout>
  );
}
