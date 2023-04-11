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
import ValidatorPage from "./pages/DelegatoryValidator";
import AnalyticsPage from "./pages/Analytics/Index";

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/validators" element={<ValidatorsPage />}>
          <Route path=":tab" element={<ValidatorsPage />} />
        </Route>
        <Route path="/validator">
          <Route path=":address" element={<ValidatorPage />} />
        </Route>
        <Route path="/txn">
          <Route path=":txnHashOrVersion" element={<TransactionPage />} />
          <Route path=":txnHashOrVersion/:tab" element={<TransactionPage />} />
        </Route>
        <Route path="/account">
          <Route
            path=":address/modules/:selectedModuleName/:modulesTab"
            element={<AccountPage />}
          />
          <Route
            path=":address/modules/:selectedModuleName"
            element={<AccountPage />}
          />
          <Route path=":address/:tab" element={<AccountPage />} />
          <Route path=":address" element={<AccountPage />} />
        </Route>
        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/block">
          <Route path=":height" element={<BlockPage />} />
          <Route path=":height/:tab" element={<BlockPage />} />
        </Route>
        <Route path="/token">
          <Route path=":tokenId/:propertyVersion" element={<TokenPage />} />
          <Route
            path=":tokenId/:propertyVersion/:tab"
            element={<TokenPage />}
          />
        </Route>
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ExplorerLayout>
  );
}
