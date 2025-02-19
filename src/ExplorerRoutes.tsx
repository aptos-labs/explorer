import React, {lazy} from "react";
import {Route, Routes} from "react-router-dom";
import ExplorerLayout from "./pages/layout";

const CoinPage = lazy(() => import("./pages/Coin/Index"));
const FAPage = lazy(() => import("./pages/FungibleAsset/Index"));
const LandingPage = lazy(() => import("./pages/LandingPage/Index"));
const NotFoundPage = lazy(() => import("./pages/layout/NotFoundPage"));
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
        <Route path="/coin">
          <Route path=":struct" element={<CoinPage />} />
          <Route path=":struct/:tab" element={<CoinPage />} />
        </Route>
        <Route path="/fungible_asset">
          <Route path=":address" element={<FAPage />} />
          <Route path=":address/:tab" element={<FAPage />} />
        </Route>

        <Route path="/account">
          <Route
            path=":address/modules/:modulesTab/:selectedModuleName"
            element={<AccountPage />}
          />
          <Route
            path=":address/modules/:modulesTab/:selectedModuleName/:selectedFnName"
            element={<AccountPage />}
          />
          <Route path=":address/:tab" element={<AccountPage />} />
          <Route path=":address" element={<AccountPage />} />
        </Route>

        <Route path="/object">
          <Route
            path=":address/modules/:modulesTab/:selectedModuleName"
            element={<AccountPage isObject={true} />}
          />
          <Route
            path=":address/modules/:modulesTab/:selectedModuleName/:selectedFnName"
            element={<AccountPage isObject={true} />}
          />
          <Route
            path=":address/:tab"
            element={<AccountPage isObject={true} />}
          />
          <Route path=":address" element={<AccountPage isObject={true} />} />
        </Route>

        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/block">
          <Route path=":height" element={<BlockPage />} />
          <Route path=":height/:tab" element={<BlockPage />} />
        </Route>
        <Route path="/token">
          <Route path=":tokenId" element={<TokenPage />} />
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
