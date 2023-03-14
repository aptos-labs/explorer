import React, {Suspense, lazy} from "react";
import {Route, Routes} from "react-router-dom";

const LandingPage = lazy(() => import("./pages/LandingPage/Index"));
const NotFoundPage = lazy(() => import("./pages/layout/NotFoundPage"));
const ExplorerLayout = lazy(() => import("./pages/layout"));
const TransactionPage = lazy(() => import("./pages/Transaction/Index"));
const AccountPage = lazy(() => import("./pages/Account/Index"));
const BlockPage = lazy(() => import("./pages/Block/Index"));
const TokenPage = lazy(() => import("./pages/Token/Index"));
const TransactionsPage = lazy(() => import("./pages/Transactions/Index"));
const BlocksPage = lazy(() => import("./pages/Blocks/Index"));
const ValidatorsPage = lazy(() => import("./pages/Validators/Index"));
const ValidatorPage = lazy(() => import("./pages/DelegatoryValidator"));
const AnalyticsPage = lazy(() => import("./pages/Analytics/Index"));

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Suspense fallback={<div>Loading...</div>}>
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
            <Route
              path=":txnHashOrVersion/:tab"
              element={<TransactionPage />}
            />
          </Route>
          <Route path="/account">
            <Route path=":address" element={<AccountPage />} />
            <Route path=":address/:tab" element={<AccountPage />} />
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
      </Suspense>
    </ExplorerLayout>
  );
}
